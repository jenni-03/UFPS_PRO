import Pregunta from '../models/Pregunta.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';
import lodash from 'lodash';
import PruebaCompetencia from '../models/PruebaCompetencia.js';
import PreguntaConfiguracion from '../models/PreguntaConfiguracion.js';
import { Op } from 'sequelize';


/**
 * Función encargada de asignar las preguntas a una prueba, una vez cumplidos los requisitos de asignación 
 * @param {number} pruebaId 
 * @param {number} semestre 
 * @param {Transaction} t 
 */
export const asignQuestions = async (pruebaId, semestre) => {

    // Obtenemos las configuraciones realizadas
    const categorias = await ConfiguracionCategoria.findAll({
        where: {
            prueba_id: pruebaId
        },
        raw: true
    });

    // Comenzamos la asignación de preguntas por cada categoria
    for (let i = 0; i < categorias.length; i++) {
        await createTestQuestion(categorias[i].categoria_id, categorias[i].id, categorias[i].cantidad_preguntas, semestre);
    }

};


/**
 * Función encargada de escoger aleatoriamente las preguntas a asignar de una categoria especifica
 * @param {number} id_categoria 
 * @param {number} id_configuracion 
 * @param {number} cant_preguntas_categoria 
 * @param {number} semestre 
 */
const createTestQuestion = async (id_categoria, id_configuracion, cant_preguntas_categoria, semestre) => {


    //Obtenemos las preguntas que pertenecen al semestre y a la categoria designados
    const questions = await Pregunta.findAll({
        where: {
            categoria_id: id_categoria,
            semestre: {
                [Op.lte]: semestre,
            },
            estado: 1
        }
    })

    const questions_to_be_assigned = lodash.sampleSize(questions, cant_preguntas_categoria);

    for (const question of questions_to_be_assigned) {

        //agregamos la pregunta a la prueba
        await PreguntaConfiguracion.create({
            pregunta_id: question.id,
            configuracion_categoria_id: id_configuracion
        });

    }

}


/**
 * Función encargada de actualizar las preguntas a asignar de una categoria especifica
 * @param {number} id_categoria 
 * @param {number} id_configuracion 
 * @param {number} cant_preguntas_categoria 
 * @param {number} semestre 
 * @param {object} res 
 */
export const updateTestQuestions = async (id_categoria, id_configuracion, cant_preguntas_categoria, semestre, res, t) => {


    //Obtenemos las preguntas que pertenecen al semestre y a la categoria designados
    const questions = await Pregunta.findAll({
        where: {
            categoria_id: id_categoria,
            semestre: {
                [Op.lte]: semestre,
            },
            estado: 1
        }
    })

    if (questions.length < cant_preguntas_categoria){
        res.status(400);
        throw new Error('El número de preguntas solicitadas supera las actualmente disponibles');
    }

    const questions_to_be_assigned = lodash.sampleSize(questions, cant_preguntas_categoria);

    for (const question of questions_to_be_assigned) {

        //agregamos la pregunta a la prueba
        await PreguntaConfiguracion.create({
            pregunta_id: question.id,
            configuracion_categoria_id: id_configuracion
        }, {
            transaction: t
        });

    }

}


/**
 * Función encargada de asignar las competencias a una prueba especifica
 * @param {number} pruebaId 
 * @param {object} competencias 
 * @param {Transaction} t 
 * @param {object} res
 */
export const asignCompetences = async (pruebaId, competencias, t, res) => {

    const errorMessage = 'El formato de las competencias por asignar no es correcto';

    if (competencias === undefined) {
        res.status(400);
        throw new Error('Las competencias de la prueba son requeridas');
    }

    if (!Array.isArray(competencias) || competencias?.length === 0) {
        res.status(400);
        throw new Error(errorMessage);
    }

    if (!competencias.every(competencia => typeof competencia === 'number')) {
        res.status(400);
        throw new Error(errorMessage);
    }

    // Creamos las relaciones con competencias
    for (const competencia_id of competencias) {

        await PruebaCompetencia.create({
            prueba_id: pruebaId,
            competencia_id
        }, { transaction: t });

    }

};
