import Pregunta from '../models/Pregunta.js';


/** Función encargada de validar que el valor porcentual por categoria coincida con los limites 
 *  establecidos
 */
export const validate_percentage_categories = (valoresCategoria) => {

    try{

        const valor_categoria = valoresCategoria[1];
        
        // Validamos que el porcentaje por cada categoria
        // NO supere el total (100%)
        if(valor_categoria > 100){
            throw new Error('El valor porcentual por categoria no puede superar el 100%');
        }

        return valor_categoria;

    }catch(error){
        throw new Error(`Error al actualizar los porcentajes de las categorias: ${error.message}`);
    }

};


/** Función encargada obtener la cantidad de preguntas actuales por categoria cumpla con la 
 *  demanda establecida en la prueba
 */
export const validCantQuestions = async (semestre, categoria_id) => {

    try{

        // Obtenemos la cantidad total de preguntas de esa categoria
        const numero_preguntas = await Pregunta.findAll({
            where: {
                categoria_id,
                semestre
            }
        });

        return numero_preguntas.length;

    }catch(error){
        throw new Error(`Error al validar la cantidad de preguntas por categoria: ${error.message}`);
    }

}

