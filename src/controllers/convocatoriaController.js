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
import { tieneDuplicados } from '../util/duplicatedStudents.js';
import moment from 'moment';
import Respuesta from '../models/Respuesta.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';
import Pregunta from '../models/Pregunta.js';
import logger from '../middlewares/logger.js';


// ########## ADMIN ####################### 

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
            order: [['fecha_fin', 'DESC']],
            include: {
                model: Prueba,
                as: 'Prueba',
                attributes: ['nombre']
            }
        });

        // Formateamos las fechas de inicio y fin para su visualización en la interfaz
        const formatedConvocatorias = convocatorias.map(convocatoria => {

            return {
                id: convocatoria.id,
                nombre: convocatoria.nombre,
                fecha_inicio: moment(convocatoria.fecha_inicio).format('DD-MM-YYYY HH:mm'),
                fecha_fin: moment(convocatoria.fecha_fin).format('DD-MM-YYYY HH:mm'),
                estado: convocatoria.estado,
                prueba: convocatoria.Prueba
            }

        });

        // Respondemos al usuario
        res.status(200).json(formatedConvocatorias);

    } catch (error) {
        const errorGetConv = new Error(`Ocurrio un problema al intentar obtener las convocatorias - ${error.message}`);
        errorGetConv.stack = error.stack; 
        next(errorGetConv);
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
                attributes: ['id', 'nombre']
            }
        });

        if (!convocatoria) {
            return res.status(400).json({error: 'No se encuentra ninguna convocatoria con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json({
            nombre: convocatoria.nombre,
            descripcion: convocatoria.descripcion,
            fecha_inicio: moment(convocatoria.fecha_inicio).format('DD-MM-YYYY HH:mm'),
            fecha_fin: moment(convocatoria.fecha_fin).format('DD-MM-YYYY HH:mm'),
            estado: convocatoria.estado,
            prueba: {
                id: convocatoria.Prueba.id,
                nombre: convocatoria.Prueba.nombre
            }
        });

    } catch (error) {
        const errorGetConvId = new Error(`Ocurrio un problema al intentar obtener la convocatoria especificada - ${error.message}`);
        errorGetConvId.stack = error.stack; 
        next(errorGetConvId);
    }

};


/* --------- createConvocatoria function -------------- */

const createConvocatoria = async (req, res, next) => {

    // Obtenemos los datos de la convocatoria
    const { convocatoria_nombre, convocatoria_descripcion, fecha_inicio, fecha_fin, prueba_id } = req.body;

    try {

        // Obtenemos el archivo excel cargado por el usuario 
        const excelFileBuffer = req.files.archivo.data;

        // Validamos que la fechas sean coherentes
        const error_fecha = validarFechaCoherente(moment(fecha_inicio).tz('America/Bogota'), moment(fecha_fin).tz('America/Bogota'));

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


        if (dataExcel.length === 0) {
            res.status(400);
            throw new Error('El archivo excel de estudiantes no puede estar vacio');
        }


        // Verificamos que no haya duplicados en los encabezados
        let headers = Object.keys(dataExcel[0]);

        let headersSet = new Set(headers);

        if (headers.length !== headersSet.size) {
            res.status(400);
            throw new Error('No se permite el uso de encabezados duplicados');
        }


        // Verificamos que no haya duplicados en el conjunto de estudiantes cargados
        if (tieneDuplicados(dataExcel)){
            res.status(400);
            throw new Error('No se permiten estudiantes con codigos o correos repetidos');
        }

       
        // Obtenemos todos los estudiantes existentes
        const existingStudents = await Usuario.findAll({
            where: {
                tipo: 'Estudiante'
            },
            attributes: ['id', 'codigo', 'email', 'fecha_inactivacion'],
            paranoid: false
        });


        //Inicializamos la transacción
        const result = await sequelize.transaction(async (t) => {

            // Creamos la convocatoria
            const convocatoria = await Convocatoria.create({
                nombre: convocatoria_nombre,
                descripcion: convocatoria_descripcion,
                fecha_inicio: new Date(moment(fecha_inicio).tz('America/Bogota')),
                fecha_fin: new Date(moment(fecha_fin).tz('America/Bogota')),
                prueba_id
            }, {transaction: t});


            // Arreglo que contiene los datos de los estudiantes tanto estudiantes como nuevos y sus inscripciones
            const newInscripcionesData = [];
            const existInscripcionesData = [];
            const newStudents = [];
            const existStudents = [];


            // Registramos los datos de los usuarios
            for (const itemFila of dataExcel) {

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
                    throw new Error('No se aceptan semestres no validos');
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
                    throw new Error('No se permiten codigos de estudiantes no validos');
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


                // Verificamos si el estudiante ya existe tanto en los usuarios actuales como eliminados
                const existingStudent = existingStudents.find(student => 
                    student.codigo === codigo || student.email === email
                );


                // En caso de existir solo notificamos al usuario y creamos su inscripcion
                if (existingStudent) {

                    if (existingStudent.fecha_inactivacion !== null) await existingStudent.restore();

                    // Verificamos que el usuario ya registrado no contenga una inscripción a la prueba
                    const inscripcionExist = await Inscripcion.findOne({
                        where: {
                            usuario_id: existingStudent.id,
                            convocatoria_id: convocatoria.id
                        }
                    })

                    if (!inscripcionExist){

                        // Agregamos la inscripción a nuestro array de inscripciones
                        existInscripcionesData.push({
                            fecha_inscripcion: new Date(moment().tz('America/Bogota')),
                            usuario_id: existingStudent.id,
                            convocatoria_id: convocatoria.id
                        });

                        existStudents.push(existingStudent);

                    }

                } else{

                    // Generamos la contraseña
                    const newPassword = password_generator.generate({
                        length: 15,
                        numbers: true,
                        symbols: true
                    });

                    // Ciframos la contraseña
                    const hashedPassword = await encryptPasswd(newPassword);

                    newStudents.push({

                        nombre,
                        apellido,
                        codigo,
                        email,
                        password: hashedPassword,
                        tipo: 'Estudiante',
                        semestre,
                        rol_id: 2

                    });

                    // Agregamos la inscripción a nuestro array de inscripciones
                    newInscripcionesData.push({
                        fecha_inscripcion: new Date(moment().tz('America/Bogota')),
                        usuario_id: null,
                        convocatoria_id: convocatoria.id
                    });

                }
                

            }


            // Registramos a los estudiantes nuevos
            const created_students = await Usuario.bulkCreate(newStudents, { returning: true, transaction: t });


            // Actualizamos el valor de las inscripciones a cada uno de los usuarios registrados
            for (let i = 0; i < created_students.length; i++) {
                newInscripcionesData[i].usuario_id = created_students[i].id;
            }


            // Creamos las inscripciones
            await Promise.all([
                Inscripcion.bulkCreate(existInscripcionesData, { transaction: t }),
                Inscripcion.bulkCreate(newInscripcionesData, { transaction: t })
            ]);


            const estudiantes_correos = newStudents.concat(existStudents).map(estudiante => {
                return estudiante.email;
            });

            // Enviamos correo de confirmación de registro
            await generateCorreo(estudiantes_correos, convocatoria.nombre, convocatoria.descripcion, convocatoria.fecha_inicio, convocatoria.fecha_fin);

            return existInscripcionesData.length + newInscripcionesData.length;

        });

        res.status(200).json({ message: `Se han inscrito ${result.length} estudiantes satisfactoriamente para la convocatoria` });

    } catch (err) {
        const errorCreateConv = new Error(`Ocurrio un problema al intentar crear la convocatoria - ${err.message}`);
        errorCreateConv.stack = err.stack; 
        next(errorCreateConv);
    }

};


/* --------- updateConvocatoria function -------------- */

const updateConvocatoria = async (req, res, next) => {

    //Obtenemos el id
    const { id } = req.params;

    // Obtenemos los datos a actualizar
    const { nombre, prueba_id, descripcion, fecha_inicio, fecha_fin, estado } = req.body;

    try {

        // Obtenemos la convocatoria y la prueba
        const [ convocatoria, existPrueba ] = await Promise.all([
            Convocatoria.findByPk(id),
            Prueba.findByPk(prueba_id)
        ])
        
        //Verificamos que exista la convocatoria
        if (!convocatoria) {
            return res.status(400).json({ error: 'No se encuentra ninguna convocatoria con el id especificado' });
        }

        // Validamos que exista la prueba enlazada a la convocatoria
        if (!existPrueba) {
            return res.status(400).json({ error: 'No existe ninguna prueba con el id especificado' })
        }


        // Validamos que la fechas sean coherentes
        const inicioValido = moment(fecha_inicio, true).tz('America/Bogota').isValid();
        const finValido = moment(fecha_fin, true).tz('America/Bogota').isValid();

        if (!inicioValido || !finValido) return res.status(400).json({ error: 'Las fechas proporcionadas no poseen un formato valido' });

        const error_fecha = validarFechaCoherente(moment(fecha_inicio).tz('America/Bogota'), moment(fecha_fin).tz('America/Bogota'));

        if (error_fecha) {
            return res.status(400).json({ error: error_fecha });
        }


        //Actualizamos la convocatoria
        await convocatoria.update({
            nombre,
            descripcion,
            estado,
            fecha_inicio: new Date(fecha_inicio),
            fecha_fin: new Date(fecha_fin),
            prueba_id
        });


        // Si la convocatoria es desactivada, deshabilitamos todas las inscripciones asociadas a esta y calculamos los resultados
        if(!convocatoria.estado){

            await Inscripcion.update({ estado: 0 }, {

                where: {
                    convocatoria_id: convocatoria.id
                }

            });


            // Calculamos los resultados

            // Registramos el suceso
            logger.info(`La convocatoria ${convocatoria.nombre} fue cerrada manualmente`);

        }

        res.status(200).json({ message:'Convocatoria actualizada correctamente'});

    } catch (err) {
        const errorUpdateConv = new Error(`Ocurrio un problema al intentar actualizar la convocatoria - ${err.message}`);
        errorUpdateConv.stack = err.stack; 
        next(errorUpdateConv);
    }

}


/* --------- getEstudiantesConvocatoria function -------------- */

const getEstudiantesConvocatoria = async (req, res, next) => {

    // Obtenemos el id de la convocatoria
    const {id} = req.params;

    try{

        // Consultamos la convocatoria y verificamos su existencia
        const convocatoria = await Convocatoria.findByPk(id, {
            include: [{
                model: Inscripcion,
                as: 'Inscripciones',
                include: [{
                    model: Usuario,
                    as: 'Usuario'
                }]
            }]
        });

        if(!convocatoria){
            return res.status(400).json({ error: 'No se encuentra la convocatoria especificada' });
        }

        // Obtenemos las inscripciones asociadas 
        const inscripciones = await convocatoria.getInscripciones();

        if(inscripciones.length === 0){
            return res.status(200).json([]);
        }
        
        // Obtenemos los estudiantes a partir de sus inscripciones
        const estudiantes = convocatoria.Inscripciones.map(inscripcion => {

            const usuario = inscripcion.Usuario;
            return {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.email,
                codigo: usuario.codigo
            };

        });

        return res.status(200).json(estudiantes);

    }catch(error){
        const errorGetEstConv = new Error(`Ocurrio un problema al obtener los estudiantes de la convocatoria - ${error.message}`);
        errorGetEstConv.stack = error.stack; 
        next(errorGetEstConv);
    }

}


/* --------- expulsarEstudianteConvocatoria function -------------- */

const expulsarEstudianteConvocatoria = async (req, res, next) => {

    // Obtenemos el id del usuario y el de la convocatoria
    const { user_id, conv_id } = req.params;

    try{

        // Eliminamos la inscripcion de la convocatoria asociada a ese estudiante
        await Inscripcion.destroy({
            where: {
                usuario_id: user_id,
                convocatoria_id: conv_id
            }
        });

        return res.status(200).json({ message: 'Se ha expulsado al estudiante de la convocatoria correctamente' });

    }catch(error){
        const deleteEstConv = new Error(`Ocurrio un problema al desvincular al estudiante de la convocatoria - ${error.message}`);
        deleteEstConv.stack = error.stack; 
        next(deleteEstConv);
    }

}


/* --------- getPreguntasConvocatoria function -------------- */

const getPreguntasConvocatoria = async (req, res, next) => {

    // Obtenemos el id de la convocatoria
    const {id} = req.params;

    try{

        // Consultamos la convocatoria y verificamos su existencia
        const convocatoria = await Convocatoria.findByPk(id, {
            include: {
                model: Prueba
            }
        });

        if(!convocatoria){
            return res.status(400).json({ error: 'No se encuentra la convocatoria especificada' });
        }

        // Obtenemos la prueba asociada a la convocatoria
        const prueba = await Prueba.findByPk(convocatoria.prueba_id, {

            include: {
                model: ConfiguracionCategoria,
                as: 'Configuraciones_categorias',
                include: {
                    model: Pregunta,
                    attributes: ['id', 'texto_pregunta', 'opciones', 'imagen'],
                    as: 'Preguntas',
                    through: {
                        attributes: []
                    }
                }
            }

        });

        let preguntas = [];

        for (let configuracionCategoria of prueba.Configuraciones_categorias){

            configuracionCategoria.Preguntas.map(pregunta => {
                preguntas.push({ id: pregunta.id, texto: pregunta.texto_pregunta, opciones: JSON.parse(pregunta.opciones), imagen: pregunta.imagen });
            });

        }

        return res.status(200).json(preguntas);

    }catch(error){
        const errorGetQuestConv = new Error(`Ocurrio un problema al obtener las preguntas asociadas a la prueba - ${error.message}`);
        errorGetQuestConv .stack = error.stack; 
        next(errorGetQuestConv);
    }

}


/* --------- createStudent function -------------- */

const createStudent =  async (req, res, next) => {

    // Obtenemos el id de la convocatoria
    const { id } = req.params;

    // Obtenemos los datos de el estudiante a crear
    const { nombre, apellido, codigo, email, semestre } = req.body; 

    try {

        // Validamos que el código y email sea único
        const [ studentExist, convocatoria ] = await Promise.all([

            Usuario.findOne({
                where: {
                    [Op.or]: [
                        {codigo},
                        {email}
                    ]
                },
                paranoid: false
            }),
            Convocatoria.findByPk(id)

        ])

        // Si el estudiante existe, se verifica la inscripción a la convocatoria
        if(studentExist){

            if (studentExist.fecha_inactivacion !== null) await studentExist.restore();

            // Determinamos si el estudiante ya esta inscrito a la convocatoria
            const inscripcion = await Inscripcion.findOne({
                where: {
                    usuario_id: studentExist.id,
                    convocatoria_id: id
                }
            });

            if (inscripcion){

                if (!inscripcion.estado) return res.status(400).json({error: 'La inscripción del usuario se encuentra vencida'});

                return res.status(400).json({error: 'El usuario ya se encuentra registrado en la convocatoria'});

            }

            // Registramos su inscripcion a la convocatoria
            await Inscripcion.create({
                fecha_inscripcion: new Date(moment().tz('America/Bogota')),
                usuario_id: studentExist.id,
                convocatoria_id: convocatoria.id
            });


        }else{

            // Generamos la contraseña
            const password = password_generator.generate({
                length: 15,
                numbers: true,
                symbols: true
            });

            // Ciframos la contraseña
            const hashedPassword = await encryptPasswd(password);

            // Creamos el usuario
            const new_student = await Usuario.create({
                nombre,
                apellido,
                codigo,
                email,
                password: hashedPassword,
                tipo: 'Estudiante',
                semestre,
                rol_id: 2
            });

            // Registramos su inscripcion a la convocatoria
            await Inscripcion.create({
                fecha_inscripcion: new Date(moment().tz('America/Bogota')),
                usuario_id: new_student.id,
                convocatoria_id: convocatoria.id
            });

        }

        // Enviamos correo de confirmación de registro
        await generateCorreo([email], convocatoria.nombre, convocatoria.descripcion, convocatoria.fecha_inicio, convocatoria.fecha_fin);

        // Respondemos al usuario
        res.status(200).json({ message: `Usuario vinculado exitosamente a la convocatoria ${convocatoria.nombre}` });

    } catch (error) {
        const createEstConv = new Error(`Ocurrio un problema al vincular al estudiante a la convocatoria - ${error.message}`);
        createEstConv.stack = error.stack; 
        next(createEstConv);
    }

};


// ########## Estudiante #######################


/* --------- setProgresoEstudiante function -------------- */

const setProgresoEstudiante = async () => {

    try {

        // Obtenemos el id del usuario
        const userId = req.user.id;

        // Obtenemos el id de la convocatoria
        const { id } = req.params;
        
        // Obtenemos el id de la pregunta, el tiempo y la opcion seleccionada
        const { id_pregunta, tiempo,  opcion } = req.body;

        // Obtenemos la inscripción del estudiante a la prueba
        const inscripcion = await Inscripcion.findOne({
            where: {
                usuario_id: userId,
                convocatoria_id: id
            }
        });

        
        // Verificamos que el usuario haya seleccionado una opción
        if (opcion !== null) {

            // Registramos la respuesta
            await Respuesta.create({
                opcion,
                inscripcion_id: inscripcion.id,
                pregunta_id: id_pregunta
            });

        }

        // Actualizamos el tiempo del estudiante
        await inscripcion.update({
            tiempo_restante_prueba: tiempo
        });


        return res.status(200).json({ message: 'OK' });


    } catch (error) {
        const setProEst = new Error(`Ocurrio un problema al guardar el progreso del estudiante - ${error.message}`);
        setProEst.stack = error.stack; 
        next(setProEst);
    }


};


const getConvocatoriasEstudiante = async (req, res, next) => {

    // Obtenemos el id del usuario
    const { id } = req.user;

    // Estado
    const state = req.query.estado || true;

    try{

        // Consultamos las inscripciones actuales del estudiante
        const inscripciones = await Inscripcion.findAll({
            where: {
                usuario_id: id,
                estado: state
            },
            include: {
                model: Convocatoria,
                attributes: ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin'],
                include: {
                    model: Prueba,
                    attributes: ['id', 'nombre', 'duracion', 'descripcion', 'semestre', 'total_preguntas']
                }
            }
        });

    
        // Obtenemos las convocatorias a partir de sus inscripciones
        const convocatorias = inscripciones.map(inscripcion => {

            console.log(Object.keys(inscripcion));
            
            const { id, nombre, descripcion, fecha_inicio, fecha_fin, Prueba } = inscripcion.Convocatoria;

            return {
                id,
                nombre,
                descripcion,
                fecha_inicio: moment(fecha_inicio).format('DD-MM-YYYY HH:mm'),
                fecha_fin: moment(fecha_fin).format('DD-MM-YYYY HH:mm'),
                Prueba
            }
            
        });

        return res.status(200).json(convocatorias);

    }catch(error){
        const getConvEst = new Error(`Ocurrio un problema al obtener las convocatorias del estudiante - ${error.message}`);
        getConvEst.stack = error.stack; 
        next(getConvEst);
    }

}


/** -------- terminarPrueba function ----------------- */

const terminarPrueba = async (req, res, next) => {

    try{

        // Obtenemos el identificador del usuario y la convocatoria
        const userId = req.user.id;
        const { id } = req.params;


        // Obtenemos la inscripción del estudiante a la prueba
        const inscripcion = await Inscripcion.findOne({
            where: {
                usuario_id: userId,
                convocatoria_id: id
            }
        });


        // Actualizamos la fecha de terminación de la prueba
        await inscripcion.update({ 
            fecha_finalizacion_prueba: moment().tz('America/Bogota')
        });

        // calcular resultados prueba

        res.status(200).json({ message: 'Prueba finalizada correctamente' });

    }catch(error){
        const endTest = new Error(`Ocurrio un problema al finalizar la prueba - ${error.message}`);
        endTest.stack = error.stack; 
        next(endTest);
    }

};


/** -------- presentarPrueba function ----------------- */

const presentarPrueba = async (req, res, next) => {

    try {

        // Obtenemos el identificador del usuario y la convocatoria
        const userId = req.user.id;
        const { id } = req.params;

        // Obtenemos el usuario y la convocatoria respectivamente
        const [user, convocatoria] = await Promise.all([

            Usuario.findByPk(userId),
            Convocatoria.findOne({
                where: {
                    id,
                    estado: 1
                },
                include: {
                    model: Prueba
                }
            })

        ]);

        if (!convocatoria) {
            return res.status(400).json({ error: 'No se encontro la convocatoria especificada o no esta disponible en este momento' });
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


        // Verificamos la disponibilidad de la convocatoria
        const fecha_actual = moment().tz('America/Bogota');
        const inicio_convocatoria = moment(convocatoria.fecha_inicio);
        const fin_convocatoria = moment(convocatoria.fecha_fin);

        if (fecha_actual.isBefore(inicio_convocatoria)) {
            return res.status(400).json({ error: 'El inicio de la convocatoria no esta programado para este momento' });
        }

        if (fecha_actual.isSameOrAfter(fin_convocatoria)) {
            return res.status(400).json({ error: 'La convocatoria ha finalizado, favor contactar con el director en caso de un error' });
        }


        // Verificamos que el usuario no haya terminado la pruena
        if (inscripcion.fecha_finalizacion_prueba !== null) {
            return res.status(400).json({ error: 'Has alcanzado el número de intentos permitidos para esta prueba' });
        }


        // Si el estudiante ya posee una fecha de inicio registrada de la prueba, recuperamos sus respuestas
        let respuestas = [];
        let tiempo_prueba = 0;

        if (inscripcion.fecha_inicio_prueba) {

            respuestas = await Respuesta.findAll({
                where: {
                    inscripcion_id: inscripcion.id
                }
            });

        }else{

            // Creamos los valores predeterminados del inicio de la prueba si este aun no la iniciado
            await inscripcion.update({
                fecha_inicio_prueba: moment().tz('America/Bogota'),
                tiempo_restante_prueba: convocatoria.Prueba.duracion
            });

        }

        tiempo_prueba = inscripcion.tiempo_restante_prueba;

        return res.status(200).json({ tiempo_prueba, respuestas });

    } catch (error) {
        const doTest = new Error(`Ocurrio un problema al presentar la prueba - ${error.message}`);
        doTest.stack = error.stack; 
        next(doTest);
    }

};


const convocatoriaController = {

    getConvocatorias,
    getConvocatoriaById,
    createConvocatoria,
    updateConvocatoria,
    presentarPrueba,
    getEstudiantesConvocatoria,
    getPreguntasConvocatoria,
    getConvocatoriasEstudiante,
    expulsarEstudianteConvocatoria,
    createStudent,
    terminarPrueba,
    setProgresoEstudiante

};


export default convocatoriaController;