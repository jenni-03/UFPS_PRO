const Pregunta = require('../models/Pregunta');
const PreguntaPrueba = require('../models/PreguntaPrueba');

const createTestQuestion = async (id_prueba, id_categoria, cant_preguntas_categoria, semestre, transaction) => {
    
    try {

        //Obtenemos las preguntas que pertenecen al semestre y a la categoria designados
        const questions = await Pregunta.findAll({
            where: {
                semestre,
                categoria_id: id_categoria
            }
        })

        while(cant_preguntas_categoria > 0){

            //generamos un numero aleatorio, para seleccionar una pregunta
            const index_question = Math.floor(Math.random() * (questions.length));

            //obtenemos la pregunta
            const question = questions[index_question];

            //validamos si la pregunta ya ha sido agregada a la prueba
            const existQuestion = await PreguntaPrueba.findOne({
                where: {
                    pregunta_id: question.id,
                    prueba_id: id_prueba
                }
            })

            if(existQuestion){
                continue;
            }

            //agregamos la pregunta a la prueba
            await PreguntaPrueba.create({
                pregunta_id: question.id,
                prueba_id: id_prueba
            })

            cant_preguntas_categoria--;
        }
        
    } catch (error) {
        throw new Error(`Error al agregar la pregunta a la prueba: ${error.message}`)
    }

}

module.exports = {
    createTestQuestion
}