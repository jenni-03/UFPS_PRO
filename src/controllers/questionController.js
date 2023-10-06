import Pregunta from '../models/Pregunta.js';
import Categoria from '../models/Categoria.js';
import XLSX from "xlsx";

// Funciones de utilidad
import validateSeqOptions from '../util/seqOptions.js';
import { validateAnswers, removeQuestionsRepeat } from '../util/verifyAnswers.js';
import { uploadImage, updateFile } from '../libs/cloudinary.js';


/* --------- getAllQuestions function -------------- */

const getAllQuestions = async (req, res, next) => {

    // Estado
    const state = req.query.estado || true;

    try{

        // Obtenemos todas las preguntas de la BD
        const questions = await Pregunta.findAll({
            where: {
                estado: state
            },
            attributes: ['id', 'texto_pregunta', 'semestre', 'estado'],
            include: {
                model: Categoria,
                attributes: ['nombre']
            }
        });

        res.status(200).json(questions);

    }catch(error){
        next(new Error(`Ocurrio un problema al obtener las preguntas: ${error.message}`));
    }

};


/* --------- createQuestion function -------------- */

const createQuestion = async (req, res, next) => {

    //Obtenemos los datos de la pregunta a crear
    const {texto_pregunta, semestre, A, B, C, D, respuesta, categoria_id} = req.body;

    try {

        // Creamos el arreglo con las opciones y las respuestas
        const options = [ 'A', 'B', 'C', 'D' ];
        const answers = [ A, B, C, D ];

        // Validamos que el id de categoria corresponda a una existente
        const categoriaExist = await Categoria.findByPk(parseInt(categoria_id));

        if(!categoriaExist){
            return res.status(400).json({error: "La categoria proporcionada no corresponde con ninguna existente"});
        }

        // Validamos que la respuesta se encuentre entre las opciones disponibles
        if(!options.includes(respuesta.toUpperCase())) return res.status(400).json({ error: 'La respuesta debe coincidir con alguna de las opciones disponibles' });

        // Validamos que ninguna de las respuestas se repita
        if (!validateAnswers(answers)) return res.status(400).json({ error: 'Ninguna de las opciones de respuesta puede repetirse' });

        // Creamos la pregunta
        await Pregunta.create({
            texto_pregunta,
            semestre: parseInt(semestre),
            opciones: JSON.stringify(answers),
            respuesta: respuesta.toUpperCase(),
            categoria_id: parseInt(categoria_id)
        })

        res.status(200).json({ message: 'Pregunta creada satisfactoriamente' });

    } catch (err) {
        next(new Error(`Ocurrio un problema al intentar crear la pregunta: ${err.message}`));
    }

}


/* --------- createImageQuestion function -------------- */

const createImageQuestion = async (req, res, next) => {

    // Obtenemos los datos de la pregunta a crear
    const { texto_pregunta, semestre, A, B, C, D, respuesta, categoria_id } = req.body;
    const imagen = req.file;

    try {

        const valid_semestre = parseInt(semestre);
        const valid_categoria_id = parseInt(categoria_id)

        // Validamos que el id de categoria corresponda a una existente
        const categoriaExist = await Categoria.findByPk(valid_categoria_id);

        if(!categoriaExist){
            return res.status(400).json({error: "La categoria proporcionada no corresponde a ninguna existente"});
        }

        // Creamos el arreglo con las opciones y las respuestas
        const options = [ 'A', 'B', 'C', 'D' ];
        const answers = [ A, B, C, D ];

        // Validamos que la respuesta se encuentre entre las opciones disponibles
        if(!options.includes(respuesta.toUpperCase())) return res.status(400).json({ error: 'La respuesta debe coincidir con alguna de las opciones disponibles' });

        // Validamos que ninguna de las respuestas se repita
        if (!validateAnswers(answers)) return res.status(400).json({ error: 'Ninguna de las opciones de respuesta puede repetirse' });

        // Variables de configuración de la imagen
        let result;
        let image;

        // Formateamos el nombre
        const imageName = imagen.filename.split('.')[0];

        // Subimos la imagen a la nube
        result = await uploadImage(imagen.path, imageName);

        // Definimos los atributos a almacenar
        image = {
            url: result.secure_url,
            public_id: result.public_id
        }

        // Creamos la pregunta
        const pregunta = await Pregunta.create({
            texto_pregunta,
            semestre: valid_semestre,
            opciones: JSON.stringify(answers),
            respuesta: respuesta.toUpperCase(),
            imagen: image,
            categoria_id: valid_categoria_id
        })

        res.status(200).json({
            message: "Pregunta creada correctamente",
            imageFile: pregunta.imagen.url
        });

    } catch (err) {
        next(`Ocurrio un problema al intentar crear la pregunta con imagen: ${err.message}`);
    }

}


/* --------- createQuestions function -------------- */

const createQuestions = async (req, res, next) => {

    try{

        // Obtenemos el archivo excel cargado por el usuario 
        const excelFileBuffer = req.files.archivo.data;

        // Procesamos el archivo excel y obtenemos los datos
        const workbook = XLSX.read(excelFileBuffer, {
            type: 'buffer'
        });
        const workbookSheets = workbook.SheetNames;
        const sheet = workbookSheets[0];
        const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

        // Creamos los objetos preguntas
        const questions = dataExcel.map( async (itemFila) => {

            // Validar las cabeceras obligatorias del archivo
            if(!itemFila['Enunciado'] || !itemFila['Semestre'] || !itemFila['A'] || !itemFila['B']
            || !itemFila['C'] || !itemFila['D'] || !itemFila['Respuesta'] || !itemFila['Categoria']){

                res.status(400);
                throw new Error('Formato de archivo no correspondiente');

            }

            // Validamos el semestre
            const semesterRegex = /^\d+$/;
            if(!semesterRegex.test(itemFila['Semestre'])) {
                res.status(400);
                throw new Error('Semestre invalido');
            }

            const semestre = parseInt(itemFila['Semestre']);
            if (semestre <= 0 || semestre > 10) {
                res.status(400);
                throw new Error('El semestre debe ser un número entre 1 y 10');

            }


            // Obtenemos las opciones de respuesta
            const options = Object.keys(itemFila).filter(key => /^[A-Z]$/i.test(key));

            // Verificamos la secuencialidad de las opciones
            if (!validateSeqOptions(options)) {
                res.status(400);
                throw new Error('El formato de las opciones de respuesta no es correcto');
            }

            // Obtenemos el contenido de las opciones
            const answers = options.map(option => itemFila[option]).filter(option => option !== undefined);

            // Verificamos que no hayan respuestas repetidas
            if (!validateAnswers(answers)) {
                res.status(400);
                throw new Error('No puede haber preguntas con opciones de respuesta repetidas');
            }

            // Validamos que la respuesta se encuentre entre las opciones disponibles
            if(!options.includes(itemFila['Respuesta'])) {
                res.status(400);
                throw new Error('La respuesta debe coincidir con alguna de las opciones disponibles');
            }


            // Obtenemos la categoria de la pregunta
            const categoriaReceived = itemFila['Categoria'].toUpperCase();

            // Validamos la categoria
            const categoriaFound = await Categoria.findOne({
                where: {
                    nombre: categoriaReceived
                }
            })

            if(categoriaFound === null) {
                res.status(400);
                throw new Error(`La categoria ${categoriaReceived} proporcionada no existe`);
            }

            // Formateamos el enunciado
            const enunciado = itemFila['Enunciado'].replace(/- /g, "");
            const enunciadoFinal = enunciado.replace(/\n/g, " ");

            // Retornamos la pregunta
            return {
                texto_pregunta: enunciadoFinal,
                semestre: itemFila['Semestre'],
                opciones: JSON.stringify(answers),
                respuesta: itemFila['Respuesta'],
                categoria_id: categoriaFound.id
            };

        });

        
        // Filtramos las preguntas para eliminar las que ya existen en la BD
        const newQuestions = await Promise.all(
            questions.map(async question => {
                const pregunta_limpia = await question
                const exists = await Pregunta.findOne({
                    where: { texto_pregunta: pregunta_limpia.texto_pregunta }
                });
                return exists ? null : question;
            })
        );

        // eliminamos los valores nulos del array (repetidos)
        const filteredBDQuestions = newQuestions.filter(Boolean);

        // Aseguramos que no existan repetidos dentro del array de preguntas
        let finalQuestions = [];

        if (filteredBDQuestions.length > 0) finalQuestions = removeQuestionsRepeat(filteredBDQuestions);

        // Insertamos todas las preguntas unicas a la vez
        await Pregunta.bulkCreate(finalQuestions);

        // Preparamos el mensaje para el usuario
        let message = '';
        finalQuestions.length === 0 ? message = 'No se encontraron nuevas preguntas por ingresar' : message = `Se han procesado ${finalQuestions.length} preguntas correctamente`; 

        res.status(200).json({ message });

    }catch(err){
        next(new Error(`Ocurrio un problema al procesar el archivo de preguntas: ${err.message}`));
    }

}


/* --------- getQuestionById function -------------- */

const getQuestionById = async (req, res, next) => {

    // Obtenemos el id de la pregunta a especificar
    const {id} = req.params;

    try{

        // Obtenemos la pregunta y validamos su existencia
        const pregunta = await Pregunta.findByPk(id, {
            include: {
                model: Categoria,
                attributes: ['nombre']
            }
        });

        if(!pregunta){
            return res.status(400).json({error: 'No se encuentra ninguna pregunta con el id especificado'});
        }

        // Formateamos las opciones
        const opciones = JSON.parse(pregunta.opciones);

        const formatedOptions = opciones.map(opcion => {
            if(typeof opcion === 'number') return opcion
            return opcion.replace(/\n/g, " ")
        });

        // Formateamos la respuesta
        const response = pregunta.respuesta.replace(/\n/g, " ");

        // Respondemos al usuario
        res.status(200).json({
            enunciado: pregunta.texto_pregunta,
            opciones: formatedOptions,
            respuesta: response,
            estado: pregunta.estado,
            semestre: pregunta.semestre,
            categoria: pregunta.categoria.nombre,
            imageFile: pregunta.imagen ? pregunta.imagen.url : ''
        });

    }catch(err){
        console.log(err);
        next(`Ocurrio un problema al obtener los datos de la pregunta especificada: ${err.message}`);
    }

};


/* --------- actualizarPregunta function -------------- */

const actualizarPregunta = async (req, res, next) => {

    // Obtenemos el id de la pregunta a especificar
    const {id} = req.params;

    // Obtenemos los datos a actualizar
    const {texto_pregunta, semestre, opciones, estado, respuesta, categoria_id} = req.body;
    const imagen = req.file;

    try{

        // Obtenemos la pregunta y validamos su existencia
        const pregunta = await Pregunta.findByPk(id);

        if(!pregunta){
            return res.status(400).json({error: 'No se encuentra ninguna pregunta con el id especificado'});
        }
        
        // Formateamos el arreglo con las opciones actuales
        const options = JSON.parse(pregunta.opciones);

        // validamos que el numero de opciones recibidas sea igual a las disponibles
        if(options.length !== opciones.length){
            return res.status(400).json({error: 'La cantidad de opciones ingresadas no corresponde con la actual'});
        }

        // Validamos que el id de categoria recibido corresponda a una existente
        const categoriaExist = await Categoria.findByPk(categoria_id);

        if(!categoriaExist){
            return res.status(400).json({error: "El id de categoria proporcionado no corresponde a ninguna existente"});
        }

        // Actualizamos la pregunta
        await pregunta.update({
            texto_pregunta,
            semestre,
            opciones: JSON.stringify(opciones),
            estado,
            respuesta,
            categoria_id
        });

        // Si existe una imagen, la actualizamos
        if(imagen){

            // Variables de configuración de la imagen
            let result;
            let image;

            result = await updateFile(req.file.path, pregunta.imagen.public_id);

            // Definimos los atributos a almacenar
            image = {
                url: result.secure_url,
                public_id: result.public_id
            }

            // Actualizamos la imagen
            await pregunta.update({
                imagen: image
            });

        }

        res.status(200).json({ message: "Pregunta actualizada correctamente" });

    }catch(err){
        next(new Error(`Ocurrio un problema al actualizar la pregunta: ${err.message}`));
    }

};


const questionController = {

    getAllQuestions,
    createQuestion,
    createImageQuestion,
    createQuestions,
    getQuestionById,
    actualizarPregunta

};

export default questionController;