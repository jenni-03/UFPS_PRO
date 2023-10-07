import Pregunta from '../models/Pregunta.js';
import Categoria from '../models/Categoria.js';


/** Función encargada de los valores ingresados por categoria coincidan con los totales especificados
 *  por el usuario
 */
export const validateCategories = (valoresCategoria, total_preguntas) => {

    let total_preguntas_categoria = 0;
    let valor_total_categoria = 0

    try{

        for(const categoria_config of valoresCategoria){

            // Obtenemos los datos ingresados por categoria
            const preguntas_categoria = categoria_config[1];
            const valor_categoria = categoria_config[2];
        
            // Primero validamos que la cantidad de preguntas por categoria
            // NO supere el total de preguntas
            if(preguntas_categoria > total_preguntas){
                throw new Error('La cantidad de preguntas por categoria no puede superar al total de preguntas de la prueba');
            }
        
            // Luego validamos que el porcentaje por cada categoria
            // NO supere el total (100%)
            if(valor_categoria > 100){
                throw new Error('El valor porcentual por categoria no puede superar el 100%');
            }
        
            total_preguntas_categoria += preguntas_categoria;
            valor_total_categoria += valor_categoria;
        
        }

        return [total_preguntas_categoria, valor_total_categoria];

    }catch(error){
        throw new Error(`Error al validar los datos obtenidos por las categorias: ${error.message}`);
    }

}


/** Función encargada de validar que el valor porcentual por categoria coincida con los limites 
 *  establecidos
 */
export const validate_percentage_categories = (valoresCategoria) => {

    let valor_total_categorias = 0;

    try{

        for(const categoria_config of valoresCategoria){

            const valor_categoria = categoria_config[2];
        
            // Validamos que el porcentaje por cada categoria
            // NO supere el total (100%)
            if(valor_categoria > 100){
                throw new Error('El valor porcentual por categoria no puede superar el 100%');
            }
        
            valor_total_categorias += valor_categoria;
        
        }

        return valor_total_categorias;

    }catch(error){
        throw new Error(`Error al actualizar los porcentajes de las categorias: ${error.message}`);
    }

};


/** Función encargada de validar que la cantidad de preguntas por categoria cumpla con la 
 *  demanda establecida en la prueba
 */
export const validCantQuestions = async (valoresCategoria, semestre) => {

    try{

        for(const categoria_config of valoresCategoria){

            // Obtenemos el id de la categoria actual
            const categoriaId = categoria_config[0];
            const preguntas_categoria = categoria_config[1];

            // Obtenemos la cantidad total de preguntas de esa categoria
            const numero_preguntas = await Pregunta.findAll({
                where: {
                    categoria_id: categoriaId,
                    semestre
                }
            });

            const categoria = await Categoria.findByPk(categoriaId);

            // Validamos que la cantidad de preguntas solicitadas no supere
            // las actualmente disponibles
            if(preguntas_categoria > numero_preguntas){
                return categoria.nombre;
            }

        }

        return true;

    }catch(error){
        throw new Error(`Error al validar la cantidad de preguntas por categoria: ${error.message}`);
    }

};
