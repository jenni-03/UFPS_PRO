import Pregunta from '../models/Pregunta.js';
import PreguntaPrueba from '../models/PreguntaPrueba.js';
import lodash from 'lodash';

export const createTestQuestion = async (id_prueba, id_categoria, cant_preguntas_categoria, semestre) => {
    
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
        throw new Error(`Error al agregar las pregunta a la prueba: ${error.message}`)
    }

}
