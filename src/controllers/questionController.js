const Pregunta = require('../models/Pregunta');
const Categoria = require('../models/Categoria');
const XLSX = require("xlsx");

// Importamos el objeto de conexión
const sequelize = require('../database/db');


/* --------- getAllQuestions function -------------- */

const getAllQuestions = async (req, res) => {

    try{

        // Estado
        const state = req.query.estado || true;

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
        return res.status(500).json({error: `Error al obtener las preguntas: ${error.message}`});
    }

};


/* --------- createQuestion function -------------- */

const createQuestion = async (req, res) => {

    try {

        //Obtenemos los datos de la pregunta a crear
        const {texto_pregunta, semestre, A, B, C, D, respuesta, categoria_id} = req.body;

        // Validamos la existencia de todos los datos
        if(!texto_pregunta || !semestre || !A || !B || !C || !D || !respuesta || !categoria_id){
            return res.status(400).json({error: 'Todos los campos son requeridos'});
        }

        // Creamos el arreglo con las opciones
        const options = [A,B,C,D];

        //validamos los datos
        const regexNum = /^[0-9]+$/;
        if(!regexNum.test(semestre) || !regexNum.test(categoria_id)){
            return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
        }

        // Validamos que el id de categoria corresponda a una existente
        const categoriaExist = await Categoria.findByPk(categoria_id);

        if(!categoriaExist){
            return res.status(400).json({error: "La categoria proporcionada no corresponde a ninguna existente"});
        }

        // Creamos la pregunta
        const pregunta = await Pregunta.create({
            texto_pregunta,
            semestre,
            opciones: JSON.stringify(options),
            respuesta,
            categoria_id
        })

        res.status(200).json(pregunta);

    } catch (err) {
        return res.status(500).json({error: `Error al intentar crear la pregunta: ${err.message}`});
    }

}


/* --------- createImageQuestion function -------------- */

const createImageQuestion = async (req, res) => {

    try {

        //Obtenemos los datos de la pregunta a crear
        const {texto_pregunta, semestre, A, B, C, D, respuesta, categoria_id} = req.body;
        const imagen = req.file;

        // Validamos los datos
        const regexNum = /^[0-9]+$/;

        if(!texto_pregunta || !semestre || !A || !B || !C || !D || !respuesta || !imagen || !categoria_id){
            return res.status(400).json({error: 'Todos los campos son requeridos'});
        }

        // Creamos el arreglo con las opciones
        const options = [A,B,C,D];

        if(!regexNum.test(semestre) || (!Array.isArray(options) || options.length !== 4) || !regexNum.test(categoria_id)){
            return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
        }

        // Validamos que el id de categoria corresponda a una existente
        const categoriaExist = await Categoria.findByPk(categoria_id);

        if(!categoriaExist){
            return res.status(400).json({error: "La categoria proporcionada no corresponde a ninguna existente"});
        }

        // Creamos la pregunta
        const pregunta = await Pregunta.create({
            texto_pregunta,
            semestre,
            opciones: JSON.stringify(options),
            respuesta,
            imagen: imagen.filename,
            categoria_id
        })

        res.status(200).json({
            pregunta,
            imageFile: `https://apisimulador-production.up.railway.app/${req.file.filename}`
        });

    } catch (err) {
        return res.status(500).json({error: `Error al intentar crear una pregunta con imagen: ${err.message}`});
    }

}


/* --------- createQuestions function -------------- */

const createQuestions = async (req, res) => {

    try{

        // Creamos un array que contendra las preguntas insertadas
        const questions = [];

        //Inicializamos la transacción
        await sequelize.transaction(async (t) => {

            // Obtenemos el archivo excel cargado por el usuario 
            const excelFileBuffer = req.files.archivo.data;

            // Procesamos el archivo excel y obtenemos los datos
            const workbook = XLSX.read(excelFileBuffer, {
                type: 'buffer'
            });
            const workbookSheets = workbook.SheetNames;
            const sheet = workbookSheets[0];
            const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

            // Creamos las preguntas
            for(const itemFila of dataExcel){

                // Validar las cabeceras del archivo
                if(!itemFila['Enunciado'] || !itemFila['Semestre'] || !itemFila['A'] || !itemFila['B']
                    || !itemFila['C'] || !itemFila['D'] || !itemFila['Respuesta'] || !itemFila['Categoria']){

                    return res.status(400).json({error: 'Formato de archivo no correspondiente'});

                }
               
                // Obtener la categoria de la pregunta
                const categoriaReceived = itemFila['Categoria'].toUpperCase();

                // En caso de haber un error, verificamos la existencia de la pregunta con el fin
                // de que esta no vuelva a ser insertada
                const preguntaExist = await Pregunta.findOne({
                    where: {
                        texto_pregunta: itemFila['Enunciado']
                    }
                });

                if(preguntaExist){
                    continue;
                }

                // Validar la categoria
                const categoriaFound = await Categoria.findOne({
                    where: {
                        nombre: categoriaReceived
                    }
                })

                if(!categoriaFound){
                    return res.status(400).json({error: `La categoria ${categoriaReceived} proporcionada no existe`});
                }

                // Creamos el arreglo con las opciones
                const options = [itemFila['A'], itemFila['B'], itemFila['C'], itemFila['D']];

                // Formateamos el enunciado
                const enunciado = itemFila['Enunciado'].replace(/- /g, "");
                const enunciadoFinal = enunciado.replace(/\n/g, " ")

                // Creamos la pregunta
                const question =  await Pregunta.create({
                    texto_pregunta: enunciadoFinal,
                    semestre: itemFila['Semestre'],
                    opciones: JSON.stringify(options),
                    respuesta: itemFila['Respuesta'],
                    categoria_id: categoriaFound.id
                }, {transaction: t});

                questions.push(question);

            }

            res.status(200).json({message: `Se han procesado ${questions.length} preguntas correctamente`});

        });

    }catch(err){
        return res.status(500).json({error: `Error al procesar el archivo de preguntas: ${err.message}`});
    }

}


/* --------- getQuestionById function -------------- */

const getQuestionById = async (req, res) => {

    try{

        // Obtenemos el id de la pregunta a especificar
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexId.test(id)){
            return res.status(400).json({error: `El id ${id} no es válido`});
        }

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
            imageFile: pregunta.imagen ? `https://apisimulador-production.up.railway.app/${pregunta.imagen}` : ''
        });

    }catch(err){
        return res.status(500).json({error: `Error al obtener los datos de la pregunta especificada: ${err.message}`});
    }

};


/* --------- actualizarPregunta function -------------- */

const actualizarPregunta = async (req, res) => {

    try{

        // Obtenemos el id de la pregunta a especificar
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexId.test(id)){
            return res.status(400).json({error: `El id ${id} no es válido`});
        }

        // Obtenemos la pregunta y validamos su existencia
        const pregunta = await Pregunta.findByPk(id);

        if(!pregunta){
            return res.status(400).json({error: 'No se encuentra ninguna pregunta con el id especificado'});
        }

        // Obtenemos los datos a actualizar
        const {texto_pregunta, semestre, A, B, C, D, estado, respuesta, categoria_id} = req.body;
        const imagen = req.file;

        // Validamos la existencia de todos los datos
        if(!texto_pregunta || !semestre || !A || !B || !C || !D || !respuesta || !estado || !categoria_id){
            return res.status(400).json({error: 'Todos los campos son requeridos'});
        }
        
        // Creamos el arreglo con las opciones
        const options = [A,B,C,D];

        //validamos los datos
        if(!regexId.test(semestre) || (!Array.isArray(options) || options.length !== 4) || !regexId.test(categoria_id)){
            return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
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
            opciones: JSON.stringify(options),
            estado,
            respuesta,
            categoria_id
        });

        // Si existe una imagen, la actualizamos
        if(imagen){
            await pregunta.update({
                imagen: imagen.filename
            });
        }

        res.status(200).json(pregunta);

    }catch(err){
        return res.status(500).json({error: `Error al actualizar pregunta: ${err.message}`});
    }

};

module.exports = {
    getAllQuestions,
    createQuestion,
    createImageQuestion,
    createQuestions,
    getQuestionById,
    actualizarPregunta
}