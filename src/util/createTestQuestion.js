import Pregunta from '../models/Pregunta.js';
import PreguntaPrueba from '../models/PreguntaPrueba.js';
import lodash from 'lodash';
import PruebaCompetencia from '../models/PruebaCompetencia.js';


/**
 * Función encargada de asignar las preguntas a una prueba, una vez cumplidos los requisitos de asignación
 * @param {object} categorias 
 * @param {object} preguntas 
 * @param {number} pruebaId 
 * @param {number} semestre 
 * @param {Transaction} t 
 */
export const asignQuestions = async (categorias, preguntas, pruebaId, semestre, t) => {

    try{

        const errorMessage = 'El formato de los datos requeridos para asignar las preguntas no es correcto';

        if (categorias === undefined || preguntas === undefined) throw new Error(errorMessage);

        if (!Array.isArray(categorias) || !Array.isArray(preguntas)) throw new Error(errorMessage);

        if (categorias.length !== preguntas.length) throw new Error(errorMessage);

        // Comenzamos la asignación de preguntas por cada categoria
        for (let i = 0; i < categorias.length; i++) {
            createTestQuestion(pruebaId, categorias[i], preguntas[i], semestre);
        }

    }catch(error){
        throw new Error(`${error.message}`);
    }

};


/**
 * Función encargado de escoger aleatoriamente las preguntas a asignar de una categoria especifica
 * @param {number} id_prueba 
 * @param {number} id_categoria 
 * @param {number} cant_preguntas_categoria 
 * @param {number} semestre 
 */
const createTestQuestion = async (id_prueba, id_categoria, cant_preguntas_categoria, semestre) => {
    
    try {

        //Obtenemos las preguntas que pertenecen al semestre y a la categoria designados
        const questions = await Pregunta.findAll({
            where: {
                semestre,
                categoria_id: id_categoria,
                estado: 1
            }
        })

        const questions_to_be_assigned = lodash.sampleSize(questions, cant_preguntas_categoria);

        for (const question of questions_to_be_assigned) {

            //agregamos la pregunta a la prueba
            await PreguntaPrueba.create({
                pregunta_id: question.id,
                prueba_id: id_prueba
            })

        }
        
    } catch (error) {
        throw new Error(`${error.message}`)
    }

}


/**
 * Función encargada de asignar las competencias a una prueba especifica
 * @param {number} pruebaId 
 * @param {object} competencias 
 * @param {Transaction} t 
 */
export const asignCompetences = async (pruebaId, competencias, t) => {

    try{

        const errorMessage = 'El formato de las competencias por asignar no es correcto';

        if (competencias === undefined) throw new Error('Las competencias de la prueba son requeridas');

        if (!Array.isArray(competencias) || competencias?.length === 0) throw new Error(errorMessage);

        if (!competencias.every(competencia => typeof competencia === 'number')) throw new Error(errorMessage);

        // Creamos las relaciones con competencias
        for (const competencia_id of competencias){

            await PruebaCompetencia.create({
                prueba_id: pruebaId,
                competencia_id
            }, {transaction: t});

        }

    }catch(error){
        throw new Error(`${error.message}`);
    }

};
