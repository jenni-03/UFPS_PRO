import Prueba from '../models/Prueba.js';
import Competencia  from '../models/Competencia.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';
import { validate_percentage_categories, asignValueCategories } from '../util/validateDataCategories.js';
import { asignCompetences, asignQuestions, updateTestQuestions } from '../util/createTestQuestion.js';
import sequelize from '../database/db.js';
import Categoria from '../models/Categoria.js';
import Inscripcion from '../models/Inscripcion.js';
import Resultado from '../models/Resultado.js';
import Convocatoria from '../models/Convocatoria.js';
import PreguntaConfiguracion from '../models/PreguntaConfiguracion.js';
import Pregunta from '../models/Pregunta.js';


/* --------- getAllTests function -------------- */

const getAllTests = async (req, res, next) => {

    // Obtenemos el estado
    const state = req.query.estado || true;

    try{ 

        // Obtenemos todas las pruebas registradas en la BD
        const pruebas = await Prueba.findAll({
            where: {
                estado: state
            },
            attributes: ['id', 'nombre', 'semestre', 'total_preguntas'],
            include: {
                model: Competencia,
                attributes: ['nombre'],
                through: {
                    attributes: []
                }
            }
        });

        // Respondemos al usuario
        res.status(200).json(pruebas)

    }catch(error){
        const errorGetTest = new Error(`Ocurrio un problema al obtener las pruebas - ${error.message}`);
        errorGetTest.stack = error.stack; 
        next(errorGetTest);
    }

};



/* --------- getTestsStudents function -------------- */

const getTestsStudents = async (req, res, next) => {

    try{ 

        // Obtenemos el id del usuario
        const { id } = req.user;

        // Obtenemos todas las pruebas del estudiante a través de las inscripciones inactivas 
        const inscripciones = await Inscripcion.findAll({
            where: {
                usuario_id: id,
                estado: 0
            },
            attributes: ['id'],
            include: [

                {

                    model: Convocatoria,
                    attributes: ['id'],
                    include: {
                        model: Prueba,
                        as: 'Prueba',
                        attributes: ['nombre', 'puntaje_total'],
                        include: {
                            model: Competencia,
                            attributes: ['nombre']
                        }
                    }

                },
                {
                    model: Resultado,
                    attributes: ['puntaje'],
                    include: {
                        model: Categoria,
                        attributes: ['nombre']
                    }
                }

            ]
        });


        const pruebas = [];


        // Iteramos sobre las inscripciones
        for (let inscripcion of inscripciones){

            const infoPrueba = {
                convocatoria_id: 0,
                nombre_prueba: '',
                competencias: '',
                categorias: [],
                puntaje_total_prueba: 0,
                puntaje_total_estudiante: 0
            };


            // Convocatoria donde la inscripcion es pertenenciente
            const convocatoria_inscripcion = inscripcion.Convocatoria;

            // Registramos el id de la convocatoria
            infoPrueba.convocatoria_id = convocatoria_inscripcion.id;

            // Registramos los datos de la prueba
            infoPrueba.nombre_prueba = convocatoria_inscripcion.Prueba.nombre;

            infoPrueba.competencias = convocatoria_inscripcion.Prueba.Competencias.map(competencia => competencia.nombre);

            infoPrueba.puntaje_total_prueba = convocatoria_inscripcion.Prueba.puntaje_total;


            // Registramos los datos correspondientes a los puntajes
            let puntaje_parcial = 0;

            inscripcion.Resultados.forEach(resultado => {

                puntaje_parcial += resultado.puntaje;
                infoPrueba.categorias.push(resultado.Categoria.nombre)
                
            });

            infoPrueba.puntaje_total_estudiante = puntaje_parcial;

            pruebas.push(infoPrueba);

        }

        // Respondemos al usuario
        res.status(200).json(pruebas)

    }catch(error){
        const errorGetTestEsts = new Error(`Ocurrio un problema al obtener las pruebas - ${error.message}`);
        errorGetTestEsts.stack = error.stack; 
        next(errorGetTestEsts);
    }

};


/* --------- getTestId function -------------- */

const getTestId = async (req, res, next) => {

    //Obtenemos el id del estudiante
    const {id} = req.params;

    try{

        // Obtenemos la prueba y verificamos su existencia
        const prueba = await Prueba.findByPk(id, {
            include: {
                model: ConfiguracionCategoria,
                attributes: ['categoria_id', 'valor_categoria', 'cantidad_preguntas'],
                include: [
                    {
                        model: Categoria,
                        attributes: ['nombre']
                    }
                ]
            },
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'estado', 'puntaje_total', 'total_preguntas']
        });

        if(!prueba){
            return res.status(400).json({error: 'No se encontro ninguna prueba con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(prueba);

    }catch(error){
        const errorGetTestId = new Error(`Ocurrio un problema al obtener la prueba especificada - ${error.message}`);
        errorGetTestId.stack = error.stack; 
        next(errorGetTestId);
    }

};


/* --------- createTest function -------------- */

const createTest = async (req, res, next) => {

    // Obtenemos los datos de el estudiante a crear
    const { nombre, descripcion, semestre, duracion, total_preguntas, competencias, valorCategorias } = req.body;

    // Variable para almacenar la instancia de la prueba creada
    let result;

    try{

        // Validamos que el nombre sea único
        const existTest = await Prueba.findOne({
            where: {
                nombre
            }
        })

        if(existTest){
            return res.status(400).json({error: `El nombre de prueba: ${nombre}, ya se encuentra registrado`});
        }

        // Incializamos la transacción
        result = await sequelize.transaction(async (t) => {

            // Creamos la prueba
            const prueba = await Prueba.create({
                nombre,
                descripcion,
                semestre,
                duracion,
                total_preguntas
            }, {transaction: t});

            // Asignamos las competencias
            await asignCompetences(prueba.id, competencias, t, res)
            

            // Configuramos el valor de las categorias
            await asignValueCategories(prueba.id, valorCategorias, competencias, t, prueba.semestre, prueba.total_preguntas, res);

            return prueba;

        });

        // Asignamos las preguntas
        await asignQuestions(result.id, result.semestre)
        
        res.status(200).json({ message: `La Prueba: '${result.nombre}' fue creada exitosamente` });

    }catch(error){

        // Eliminamos la prueba en caso de que se haya creado en medio del error
        if (result){
            await Prueba.destroy({ where: { id: result.id } });
        }

        const errorCreateTest = new Error(`Ocurrio un problema al crear la prueba - ${error.message}`);
        errorCreateTest.stack = error.stack; 
        next(errorCreateTest);
    }

};


/* --------- updateTest function -------------- */

const updateTest = async (req, res, next) => {

    // Obtenemos el id de la prueba a actualizar 
    const {id} = req.params;

    // Obtenemos los datos a actualizar
    const { nombre, descripcion, duracion, estado, puntaje_total, total_preguntas, valoresCategorias } = req.body;

    try{

        // Obtenemos la prueba y validamos su existencia
        const prueba = await Prueba.findByPk(id);

        if(!prueba){
            return res.status(400).json({error: 'No se encuentra ninguna prueba asociada con el id especificado'});
        }

        // Validamos que el nombre ingresado sea unico
        const pruebaExist = await Prueba.findOne({
            where: {
                nombre
            }
        });

        if(pruebaExist && pruebaExist.id !== prueba.id){
            return res.status(400).json({error: `El nombre de prueba ${nombre} ya se encuentra registrado`});
        }

        // Validamos que la nueva cantidad de preguntas no sea menor o igual a 0
        if(total_preguntas <= 1){
            return res.status(400).json({error: 'La cantidad de preguntas minima debe ser mayor de 1'});
        }

        
        // Validamos que los nuevos porcentajes y cantidad de preguntas sean coincidentes
        let valor_total_categorias = 0;
        let cant_total_preguntas = 0;

        // Validamos que los porcentajes ingresados y el nuevo número de preguntas para las categotrias 
        // no supere el maximo posible
        for (const valores of valoresCategorias){
            
            if (valores[0] !== 0 && valores[1] !== 0){

                valor_total_categorias += validate_percentage_categories(valores, res);
                cant_total_preguntas += valores[2];

            }else{

                // Eliminamos las categorias descartadas
                await ConfiguracionCategoria.destroy({
                    where: {
                        categoria_id: valores[0],
                        prueba_id: id
                    }
                });

            }

        }

        // Excluimos las categorias descartadas
        const valorCategoriasFinal = valoresCategorias.filter(valorCategoria => valorCategoria[0] !== 0 && valorCategoria[1] !== 0);

        // Validamos el valor total de las categorias
        if(valor_total_categorias > 100 || valor_total_categorias < 100){
            return res.status(400).json({error: 'El valor total de las categorias no coincide con el 100% designado'});
        }

        if(cant_total_preguntas !== total_preguntas){
            return res.status(400).json({error: 'La cantidad de preguntas por categorias no coincide con el total designado'});
        }


        // Incializamos la transacción
        await sequelize.transaction(async (t) => {

            // Actualizamos los valores de la prueba
            await prueba.update({
                nombre,
                descripcion,
                duracion,
                estado,
                total_preguntas, 
                puntaje_total
            }, {
                transaction: t
            });


            // Actualizamos los valores de cada una de las categorias
            for(const valorCategoria of valorCategoriasFinal){

                // Obtenemos los datos de la categoria
                const categoriaId = valorCategoria[0];
                const percentage = valorCategoria[1];
                const preguntas = valorCategoria[2];

                // Actualizamos la configuración
                const config = await ConfiguracionCategoria.findOne({
                    where: {
                        categoria_id: categoriaId,
                        prueba_id: id
                    }
                });

                // Actualizamos las preguntas de la categoria en caso de que su valor cambie
                if (preguntas !== config.cantidad_preguntas){

                    await PreguntaConfiguracion.destroy({
                        where: {
                            configuracion_categoria_id: config.id
                        },
                        transaction: t
                    });

                    await updateTestQuestions(config.categoria_id, config.id, preguntas, prueba.semestre, res, t);

                }

                config.valor_categoria = percentage;
                config.cantidad_preguntas = preguntas;

                await config.save({
                    transaction: t
                });

            }


        });

        return res.status(200).json({ message: 'Prueba actualizada correctamente' });

    }catch(error){
        const errorUpdateTest = new Error(`Ocurrio un problema al actualizar la prueba - ${error.message}`);
        errorUpdateTest.stack = error.stack; 
        next(errorUpdateTest);
    }

};


/* --------- getPrevisualizedQuestions function -------------- */

const getPrevisualizedQuestions = async (req, res, next) => {

    // Obtenemos el id de la prueba
    const {id} = req.params;

    try{

        // Obtenemos la prueba asociada a la convocatoria
        const prueba = await Prueba.findByPk(id, {

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

        if(!prueba){
            return res.status(400).json({ error: 'No se encuentra la prueba especificada' });
        }

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

};


const testController = {
    getAllTests,
    getTestId, 
    createTest,
    updateTest,
    getTestsStudents,
    getPrevisualizedQuestions
};

export default testController;