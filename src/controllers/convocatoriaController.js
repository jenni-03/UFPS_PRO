import Convocatoria from '../models/Convocatoria.js';
import Prueba from '../models/Prueba.js';
import Usuario from '../models/Usuario.js';
import password_generator from 'generate-password';
import encryptPasswd from '../util/encryptPassword.js';
import generateCorreo from '../util/emailGenerator.js';
import Inscripcion from '../models/Inscripcion.js';
import sequelize from '../database/db.js';
import XLSX from "xlsx";
import { Op } from 'sequelize';
import { validarFechaCoherente } from '../util/validarFechaCoherente.js';
import dayjs from 'dayjs';


/* --------- getConvocatorias function -------------- */

const getConvocatorias = async (req, res, next) => {

    // Estado
    const state = req.query.estado || true;

    try {

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
        next(new Error(`Ocurrio un problema al obtener las convocatorias: ${error.message}`));
    }

};


/* --------- getConvocatoriaById function -------------- */

const getConvocatoriaById = async (req, res, next) => {

    //Obtenemos el id de la convocatoria
    const { id } = req.params;

    try {

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
        next(new Error(`Ocurrio un problema al intentar añadir el estudiante: ${error.message}`));
    }

};


/* --------- createConvocatoria function -------------- */

const createConvocatoria = async (req, res, next) => {

    // Obtenemos los datos de la convocatoria
    const { nombre, descripcion, fecha_inicio, fecha_fin, prueba_id } = req.body;

    try {

        // Obtenemos el archivo excel cargado por el usuario 
        const excelFileBuffer = req.files.archivo.data;

        // Validamos que la fechas sean coherentes
        const error_fecha = validarFechaCoherente(new Date(fecha_inicio), new Date(fecha_fin));

        if (error_fecha !== null) {
            return res.status(400).json({ error: error_fecha });
        }

        // Validamos la exsitencia de la prueba 
        const pruebaExist = await Prueba.findByPk(prueba_id);

        if (!pruebaExist) {
            return res.status(400).json({ error: 'No existe ninguna prueba con el id especificado' })
        }


        // Procesamos el archivo excel y obtenemos los datos
        const workbook = XLSX.read(excelFileBuffer, {
            type: 'buffer'
        });
        const workbookSheets = workbook.SheetNames;
        const sheet = workbookSheets[0];
        const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);


        // Obtenemos todos los estudiantes existentes
        const existingStudents = await Usuario.findAll({
            where: {
                tipo: 'Estudiante'
            },
            attributes: ['codigo', 'email']
        });


        //Inicializamos la transacción
        const result = await sequelize.transaction(async (t) => {

            // Creamos la convocatoria
            const convocatoria = await Convocatoria.create({
                nombre,
                descripcion,
                fecha_inicio: new Date(dayjs(fecha_inicio).format('YYYY-MM-DD HH:mm')),
                fecha_fin: new Date(dayjs(fecha_fin).format('YYYY-MM-DD HH:mm')),
                prueba_id
            }, {transaction: t});


            // Registramos los datos de los usuarios
            const promiseStudents = dataExcel.map( async (itemFila) => {

                // Validar las cabeceras del archivo
                if (!itemFila['Nombre'] || !itemFila['Apellido'] || !itemFila['Codigo'] || !itemFila['Email']
                    || !itemFila['Semestre']) {

                    res.status(400);
                    throw new Error ('Formato de archivo no correspondiente');

                }

                // Validamos el formato del semestre
                const semesterRegex = /^\d+$/;
                if(!semesterRegex.test(itemFila['Semestre'])) {
                    res.status(400);
                    throw new Error('Semestre de estudiante invalido');
                }

                const semestre = parseInt(itemFila['Semestre']);
                if (semestre <= 0 || semestre > 10) {
                    res.status(400);
                    throw new Error('El semestre debe ser un número entre 1 y 10');

                }

                // Validamos el formato del codigo
                const codeRegex = /^\d{7}$/;
                if(!codeRegex.test(itemFila['Codigo'])) {
                    res.status(400);
                    throw new Error('Codigo de estudiante invalido');
                }
                const codigo = itemFila['Codigo'];

                // Validamos el formato del email
                const regexMail = /^[a-zA-Z0-9._%+-]+@ufps.edu.co$/
                if(!regexMail.test(itemFila['Email'])) {
                    res.status(400);
                    throw new Error('El formato de correo no es valido, debe coincidir con el dominio de la UFPS');
                }
                const email = itemFila['Email'];

                // Validamos el formato del nombre y apellido
                const regexName = /^(?! )[a-zA-ZÀ-ÖØ-öø-ÿ0-9]+( [a-zA-ZÀ-ÖØ-öø-ÿ0-9]+)*(?<! )$/
                if(!regexName.test(itemFila['Nombre']) || !regexName.test(itemFila['Apellido'])) {
                    res.status(400);
                    throw new Error('El formato de nombre o apellido no son validos');
                }
                const nombre = itemFila['Nombre'];
                const apellido = itemFila['Apellido'];


                // Verificamos si el estudiante ya existe
                const exists = existingStudents.some(student => 
                    student.codigo === codigo || student.email === email
                );

                // En caso de existir solo notificamos al usuario y creamos su inscripcion
                if (exists) {

                    // Obtenemos el usuario ya registrado
                    const userExist = await Usuario.findOne({
                        where: {
                            [Op.or]: {
                                codigo,
                                email
                            }
                        }
                    });

                    // Creamos la inscripción
                    await Inscripcion.create({
                        fecha_inscripcion: new Date(dayjs().format('YYYY-MM-DD HH:mm')),
                        usuario_id: userExist.id,
                        convocatoria_id: convocatoria.id
                    }, {transaction: t});

                    // Enviamos correo de notificacion
                    await generateCorreo(`${nombre} ${apellido}`, email, password, 'Notificar', convocatoria.nombre);

                    return 1;
                }

                // Generamos la contraseña
                const password = password_generator.generate({
                    length: 15,
                    numbers: true
                });

                // Ciframos la contraseña
                const hashedPassword = await encryptPasswd(password);

                return {

                    nombre,
                    apellido,
                    codigo,
                    email,
                    password: hashedPassword,
                    tipo: 'Estudiante',
                    semestre,
                    rol_id: 2

                }
                

            }); 

            const estudiantes = Promise.all(promiseStudents);

            // Filtramos a los estudiantes nuevos
            const newStudents = (await estudiantes).filter(student => student !== 1);

            return newStudents;
            
            // Registramos a los estudiantes nuevos
            /*await Usuario.bulkCreate(newStudents);

            // Generamos la inscripción, contraseña y enviamos correo de registro
            newStudents.forEach(async(estudiante) => {

                // Creamos la inscripción a la convocatoria
                await Inscripcion.create({
                    fecha_inscripcion: dayjs().toDate(),
                    usuario_id: estudiante.id,
                    convocatoria_id: convocatoria.id
                }, {transaction: t});

                // Enviamos correo de confirmación de registro
                await generateCorreo(`${nombre} ${apellido}`, email, password, 'Registro', convocatoria.nombre);

            });*/

        });

        // { message: `Se han registrado ${estudiantes} estudiantes satisfactoriamente para la convocatoria` }
        res.status(200).json(result);

    } catch (err) {
        next(new Error(`Ocurrio un problema al intentar crear la convocatoria: ${err.message}`));
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


const convocatoriaController = {

    getConvocatorias,
    getConvocatoriaById,
    createConvocatoria,
    updateConvocatoria,
    presentarPrueba,
    getEstudiantesConvocatoria,
    getPreguntasConvocatoria

};


export default convocatoriaController;