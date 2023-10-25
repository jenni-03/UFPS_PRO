import Pregunta from '../models/Pregunta.js';
import Categoria from '../models/Categoria.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';


/**
 * Función encargada de validar que el valor porcentual por categoria coincida con los limites establecidos
 * @param {object} valoresCategoria 
 * @returns number
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
        throw new Error(`${error.message}`);
    }

};


/**
 * 
 * @param {number} pruebaId 
 * @param {object} valorCategorias 
 * @param {object} competencias 
 * @param {Transaction} t 
 * @param {number} semestre 
 * @param {number} total_preguntas 
 */
export const asignValueCategories = async ( pruebaId, valorCategorias, competencias, t, semestre, total_preguntas ) => {

    try{

        const errorMessage = 'El formato de configuración de las categorias por asignar no es correcto';

        if (valorCategorias === undefined) throw new Error('La configuración de las categorias es requerida');

        if (!Array.isArray(valorCategorias)) throw new Error(errorMessage);

        if (!valorCategorias.every(subArr => Array.isArray(subArr) && 
            subArr.every(valor => typeof valor === 'object' && !Array.isArray(valor) && valor !== null))) {
            throw new Error(errorMessage);
        }

        if (competencias.length !== valorCategorias.length) throw new Error("La cantidad de valores a configurar no coincide con el número de competencias especificadas" );

        // Variables de control para la cantidad de preguntas y valor por categoría
        let total_preguntas_categorias = 0;
        let valor_total_categorias = 0;

        const categorias = valorCategorias.flat();

        // Verficamos los valores de cada una de las categorias
        for(const categoria of categorias) {

            // Obtenemos la categoria y los datos a usar
            const { id, nombre } = await Categoria.findByPk(categoria.categoria_id);
            const cant_preguntas_necesarias = categoria.preguntas;
            const total_prueba_preguntas = total_preguntas;

            // Validamos que la cantidad de preguntas y el porcentaje no supere el total de la prueba
            if (cant_preguntas_necesarias > total_prueba_preguntas){
                throw new Error('La cantidad de preguntas por categoria no puede superar al total de preguntas de la prueba');
            }

            if (categoria.valor > 100){
                throw new Error('El valor porcentual por categoria no puede superar el 100%');
            }

            // Validamos la cantidad de preguntas por categoria general ingresadas no supere las disponibles
            const cant_preguntas_actuales = await validCantQuestions(semestre, id);

            if (cant_preguntas_actuales < cant_preguntas_necesarias){
                throw new Error(`La cantidad de preguntas solicitadas del ${semestre} semestre para la categoria ${nombre} supera las actualmente disponibles`);
            }

            total_preguntas_categorias += categoria.preguntas;
            valor_total_categorias += categoria.valor;

            // Creamos las configuraciones para las categorias
            await ConfiguracionCategoria.create({
                cantidad_preguntas: categoria.preguntas,
                valor_categoria: categoria.valor,
                prueba_id: pruebaId,
                categoria_id: categoria.categoria_id
            }, {transaction: t});

        }

        // Verificamos los valores globales de las categorias
        if (total_preguntas_categorias > total_preguntas || total_preguntas_categorias < total_preguntas){
            throw new Error('El total de preguntas por categoria no coincide con el total especificado para la prueba');
        }

        // Validamos el valor total de las categorias
        if(valor_total_categorias > 100 || valor_total_categorias < 100){
            throw new Error('El valor total de las categorias no coincide con el 100% designado');
        }

    }catch(error){
        throw new Error(`${error.message}`);
    }

};


/**
 * Función encargada obtener la cantidad de preguntas actuales por categoria cumpla con la  demanda establecida en la prueba
 * @param {number} semestre 
 * @param {number} categoria_id 
 * @returns Cantidad de preguntas validas correspondientes a una categoria
 */
const validCantQuestions = async (semestre, categoria_id) => {

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
        throw new Error(`${error.message}`);
    }

}

