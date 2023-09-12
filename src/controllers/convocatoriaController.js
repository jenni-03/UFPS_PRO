const Convocatoria = require('../models/Convocatoria');
const Prueba = require('../models/Prueba');
const Usuario = require('../models/Usuario');
const password_generator = require('generate-password');
const encryptPasswd = require('../util/encryptPassword');
const generateCorreo = require('../util/emailGenerator');
const Inscripcion = require('../models/Inscripcion');
const sequelize = require('../database/db');
const XLSX = require("xlsx");
const { Op } = require('sequelize');
const { validarFechaCoherente } = require('../util/validarFechaCoherente');


/* --------- getConvocatorias function -------------- */

const getConvocatorias = async (req, res) => {

    try {

        // Estado
        const state = req.query.estado || true;

        // Obtenemos las convocatorias
        const convocatorias = await Convocatoria.findAll({
            attributes: ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'estado'],
            where: {
                estado: state
            },
            order: [['fecha_fin', 'DESC']]
        });

        // Respondemos al usuario
        res.status(200).json(convocatorias);

    } catch (error) {
        return res.status(500).json({ error: `Error al obtener convocatorias: ${error.message}` });
    }

};


/* --------- getConvocatoriaById function -------------- */

const getConvocatoriaById = async (req, res) => {

    try {

        //Obtenemos el id de la convocatoria
        const { id } = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if (!regexId.test(id)) {
            return res.status(400).json({ error: 'id no valido' });
        }

        // Obtenemos la convocatoria y verificamos su existencia
        const convocatoria = await Convocatoria.findByPk(id, {
            include: {
                model: Prueba,
                attributes: ['nombre']
            }
        });

        // Respondemos al usuario
        res.status(200).json(convocatoria);

    } catch (error) {
        return res.status(500).json({ error: `Error al obtener los datos de la convocatoria especificada ${error.message}` });
    }

};


/* --------- createConvocatoria function -------------- */

const createConvocatoria = async (req, res) => {

    try {

        // Obtenemos los datos de la convocatoria
        const { nombre, descripcion, fecha_inicio, fecha_fin, prueba_id } = req.body;

        // Obtenemos el archivo excel cargado por el usuario 
        const excelFileBuffer = req.files.archivo.data;


        // Validamos los datos
        if (!nombre || !descripcion || !fecha_inicio || !fecha_fin || !prueba_id || !excelFileBuffer) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const regexNum = /^[0-9]+$/;
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if (!regexData.test(nombre) || !regexNum.test(prueba_id)) {
            return res.status(400).json({ error: 'La sintaxis de los datos no es correcta' });
        }


        // Validamos que la fechas sean coherentes
        const error_fecha = validarFechaCoherente(new Date(fecha_inicio), new Date(fecha_fin));

        if (error_fecha) {
            return res.status(400).json({ error: error_fecha });
        }


        // Creamos un array que contendra las usuarios insertados
        let estudiantes = 0;


        // Validamos la exsitencia de la prueba 
        const pruebaExist = await Prueba.findByPk(prueba_id);

        if (!pruebaExist) {
            return res.status(400).json({ error: 'No existe ninguna prueba con el id especificado' })
        }

        //Inicializamos la transacción
        await sequelize.transaction(async (t) => {

            // Creamos la convocatoria
            const convocatoria = await Convocatoria.create({
                nombre,
                descripcion,
                fecha_inicio: new Date(fecha_inicio),
                fecha_fin: new Date(fecha_fin),
                prueba_id
            }, {transaction: t});


            // Procesamos el archivo excel y obtenemos los datos
            const workbook = XLSX.read(excelFileBuffer, {
                type: 'buffer'
            });
            const workbookSheets = workbook.SheetNames;
            const sheet = workbookSheets[0];
            const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);


            // Registramos los datos de los usuarios
            for (const itemFila of dataExcel) {

                let estudiante_id = 0;

                // Validar las cabeceras del archivo
                if (!itemFila['Nombre'] || !itemFila['Apellido'] || !itemFila['Codigo'] || !itemFila['Email']
                    || !itemFila['Semestre']) {

                    throw new Error ('Formato de archivo no correspondiente');

                }

                // Validar el codigo y el email (deben ser unicos)
                const nombre = itemFila['Nombre'];
                const apellido = itemFila['Apellido'];
                const email = itemFila['Email'];
                const codigo = itemFila['Codigo'];
                const semestre = itemFila['Semestre'];

                const studentNoValid = await Usuario.findOne({
                    where: {
                        [Op.or]: [
                            {
                                codigo,
                                email: { [Op.ne]: email } // Email diferente al ingresado
                            },
                            {
                                codigo: { [Op.ne]: codigo }, // Código diferente al ingresado
                                email // Email coincidente al ingresado
                            }
                        ]
                    }
                });

                if (studentNoValid) {
                    throw new Error(`El código ${codigo} o el email ${email} ya fueron asignados` );
                }

                if (pruebaExist.semestre !== itemFila['Semestre']) {
                    continue;
                }


                // Validamos si el estudiante existe
                const estudianteExist = await Usuario.findOne({
                    where: {
                        nombre,
                        apellido,
                        email,
                        codigo,
                        tipo: 'estudiante'
                    }
                });


                // Si el estudiante no ha sido registrado
                if (!estudianteExist) {

                    // Generamos la contraseña
                    const password = password_generator.generate({
                        length: 15,
                        numbers: true
                    });

                    // Ciframos la contraseña
                    const hashedPassword = await encryptPasswd(password);

                    // Creamos el estudiante
                    const estudiante = await Usuario.create({
                        nombre: itemFila['Nombre'],
                        apellido: itemFila['Apellido'],
                        codigo,
                        email,
                        password: hashedPassword,
                        tipo: 'estudiante',
                        semestre,
                        rol_id: 2
                    }, {transaction: t});

                    estudiante_id = estudiante.id;

                    // Enviamos correo de confirmación de registro
                    await generateCorreo(`${nombre} ${apellido}`, email, password);

                }


                // Creamos la inscripción a la convocatoria
                await Inscripcion.create({
                    fecha_inscripcion: new Date(),
                    usuario_id: estudianteExist !== null ? estudianteExist.id : estudiante_id,
                    convocatoria_id: convocatoria.id
                }, {transaction: t});

                estudiantes += 1;

            }

            if (estudiantes === 0) {
                throw new Error (`No se pudo almacenar a ningun estudiante` );
            }

        });

        res.status(200).json({ message: `Se han registrado ${estudiantes} estudiantes satisfactoriamente para la convocatoria` });

    } catch (err) {
        return res.status(500).json({ error: `Error al procesar el archivo de estudiantes: ${err.message}` });
    }

};


/** -------- presentarPrueba function ----------------- */

const presentarPrueba = async (req, res) => {

    try {

        // Obtenemos el usuario 

        const username = req.user.username;

        const user = await Usuario.findOne({
            where: {
                email: username
            }
        });


        // Obtenemos los datos de la convocatoria

        const { id } = req.params;

        const convocatoria = await Convocatoria.findOne({
            where: {
                id,
                estado: 1
            },
            include: {
                model: Prueba
            }
        });

        if (!convocatoria) {
            return res.status(400).json({ error: 'No se encontro la convocatoria especificada o no esta disponible en este momento' });
        }


        // Verificamos la disponibilidad de la convocatoria

        const fecha_actual = new Date().getTime();
        const inicio_convocatoria = new Date(convocatoria.fecha_inicio).getTime();
        const fin_convocatoria = new Date(convocatoria.fecha_fin).getTime();

        if (inicio_convocatoria < fecha_actual) {
            return res.status(400).json({ error: 'La convocatoria no está disponible en este momento' });
        }

        if (fin_convocatoria > fecha_actual) {
            return res.status(400).json({ error: 'La convocatoria ha finalizado, favor contactar con el director en caso de un error' });
        }


        // Validamos la legitimidad de la inscripción del estudiante

        const inscripcion = await Inscripcion.findOne({
            where: {
                usuario_id: user.id,
                convocatoria_id: convocatoria.id
            }
        });

        if (!inscripcion) {
            return res.status(400).json({ error: 'No posees una inscripción registrada para esta convocatoria' });
        }


        // Verificamos que el usuario no haya terminado la pruena

        if (inscripcion.fecha_finalizacion_prueba) {
            return res.status(400).json({ error: 'El número de intentos permitidos para esta prueba es solamente uno' });
        }


        // Creamos los valores predeterminados del inicio de la prueba si este aun no la iniciado
        if (!inscripcion.fecha_inicio_prueba) {

            res.status(200).json(convocatoria);

        }

        res.status(200).json({ message: `Bienvenido` });

    } catch (error) {
        res.status(500).json({ error: `Error al presentar la prueba: ${error.message}` });
    }

};


/* --------- updateConvocatoria function -------------- */

const updateConvocatoria = async (req, res) => {

    try {

        //Obtenemos el id
        const { id } = req.params;


        // Verificamos el id
        const regexNum = /^[0-9]+$/;

        if (!regexNum.test(id)) {
            return res.status(400).json({ error: 'id no valido' });
        }


        // Obtenemos la convocatoria
        const convocatoria = await Convocatoria.findByPk(id);

        //Verificamos que exista la convocatoria
        if (!convocatoria) {
            return res.status(400).json({ error: 'No se encuentra ninguna convocatoria con el id especificado' });
        }


        // Obtenemos los datos a actualizar
        const { nombre, prueba_id, descripcion, fecha_inicio, fecha_fin } = req.body;

        // Validamos los datos a actualizar
        if (!nombre || !prueba_id || !descripcion || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if (!regexData.test(nombre) || !regexNum.test(prueba_id)) {
            return res.status(400).json({ error: 'La sintaxis de los datos no es correcta' });
        }


        // Validamos que exista la prueba enlazada a la convocatoria
        const existPrueba = await Prueba.findByPk(prueba_id);

        if (!existPrueba) {
            return res.status(400).json({ error: 'No existe ninguna prueba con el id especificado' })
        }


        // Validamos que la fechas sean coherentes
        const error_fecha = validarFechaCoherente(new Date(fecha_inicio), new Date(fecha_fin));

        if (error_fecha) {
            return res.status(400).json({ error: error_fecha });
        }


        //Actualizamos la convocatoria
        await convocatoria.update({
            nombre,
            descripcion,
            fecha_inicio: new Date(fecha_inicio),
            fecha_fin: new Date(fecha_fin),
            prueba_id
        })

        res.status(200).json('Convocatoria actualizada correctamente');

    } catch (err) {
        return res.status(500).json({ error: `Error al actualizar la convocatoria: ${err.message}` });
    }

}


/* --------- getEstudiantesConvocatoria function -------------- */

const getEstudiantesConvocatoria = async (req, res) => {

    try{

        // Obtenemos el id de la convocatoria
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if (!regexId.test(id)) {
            return res.status(400).json({ error: 'id no valido' });
        }

        // Consultamos la convocatoria y verificamos su existencia
        const convocatoria = await Convocatoria.findByPk(id);

        if(!convocatoria){
            return res.status(400).json({ error: 'No se encuentra la convocatoria especificada' });
        }

        // Obtenemos las inscripciones asociadas 
        const inscripciones = await convocatoria.getInscripciones();

        if(!inscripciones){
            return res.status(400).json({ error: 'No se encontraron estudiantes registrados a esta convocatoria' });
        }
        
        // Obtenemos los estudiantes a partir de sus inscripciones
        const estudiantesPromise = inscripciones.map(async (inscripcion) => await inscripcion.getUsuario());

        const estudiantes = await Promise.all(estudiantesPromise);

        return res.status(200).json(estudiantes);

    }catch(error){
        console.log(error)
        return res.status(500).json({error: `Error al obtener los estudiantes de la convocatoria: ${error.message}`});
    }

}


/* --------- getPreguntasConvocatoria function -------------- */

const getPreguntasConvocatoria = async (req, res) => {

    try{

        // Obtenemos el id de la convocatoria
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if (!regexId.test(id)) {
            return res.status(400).json({ error: 'id no valido' });
        }

        // Consultamos la convocatoria y verificamos su existencia
        const convocatoria = await Convocatoria.findByPk(id);

        if(!convocatoria){
            return res.status(400).json({ error: 'No se encuentra la convocatoria especificada' });
        }

        // Obtenemos la prueba asociada a la convocatoria
        const prueba = await convocatoria.getPrueba();

        // Obtenemos las preguntas a partir de la prueba
        const preguntas = await Prueba.findAll({
            
        });

        return res.status(200).json(preguntas);

    }catch(error){
        return res.status(500).json({error: `Error al obtener las preguntas asociadas a la prueba de la convocatoria: ${error.message}`});
    }

}


module.exports = {
    getConvocatorias,
    getConvocatoriaById,
    createConvocatoria,
    updateConvocatoria,
    presentarPrueba,
    getEstudiantesConvocatoria,
    getPreguntasConvocatoria
}