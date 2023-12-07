import Prueba from "../models/Prueba.js";
import ConfiguracionCategoria from "../models/ConfiguracionCategoria.js";
import Pregunta from "../models/Pregunta.js";
import Respuesta from "../models/Respuesta.js";
import Resultado from "../models/Resultado.js";
import { posicionEnAlfabeto } from "./verifyAnswers.js";


/**
 * 
 * @param {number} pruebaId 
 * @param {number} inscripcionId 
 */
async function calcularResultado(pruebaId, inscripcionId) {
 
    // Obtén la prueba y sus configuraciones de categoría
    const prueba = await Prueba.findByPk(pruebaId, {
        include: {
            model: ConfiguracionCategoria,
            as: 'Configuraciones_categorias',
            include: {
                model: Pregunta,
                attributes: ['id', 'respuesta'],
                as: 'Preguntas',
                through: {
                    attributes: []
                }
            }
        }
    });

 
    // Obtenemos las respuestas del estudiante
    const respuestas = await Respuesta.findAll({
        where: {
            inscripcion_id: inscripcionId
        }
    });
 
 
    // Arreglo que contiene los resultados del estudiante
    const resultados = [];
 
 
    // Si el usuario no presento la prueba, asignamos resultados automaticamente
    if (respuestas.length === 0) {
 
        for (let configuracionCategoria of prueba.Configuraciones_categorias) {
 
            resultados.push({
 
                puntaje: 0,
                categoria_id: configuracionCategoria.categoria_id,
                inscripcion_id: inscripcionId
 
            })
 
        }
 
    } else {
 
        // Formateamos las respuestas del estudiante
        const respuestas_final = {};
 
        for (const respuesta of respuestas) {
 
            if (respuesta.opcion === null) {
 
                respuestas_final[respuesta.pregunta_id] = 0;
 
            } else {
 
                respuestas_final[respuesta.pregunta_id] = parseInt(respuesta.opcion) + 1;
 
 
            }
 
        }
 
        const puntajeMaxPrueba = prueba.puntaje_total;
 
        // Calculamos el puntaje por categoría
        for (let configuracionCategoria of prueba.Configuraciones_categorias) {
 
            // Puntaje máximo a obtener en la categoria
            const puntajeMaxCategoria = puntajeMaxPrueba * (configuracionCategoria.valor_categoria / 100);
 
            // Puntaje máximo a obtener por cada pregunta en dicha categoria
            const puntajeMaxPregunta = puntajeMaxCategoria / configuracionCategoria.cantidad_preguntas;
 
            // Puntaje conseguido por el estudiante en esa categoria
            let puntajeCategoria = 0;
 
            for (const pregunta of configuracionCategoria.Preguntas) {
 
                if (respuestas_final.hasOwnProperty(pregunta.id)) {
 
                    // Obtenemos la posición del abecedario
                    const posicion_respuesta = posicionEnAlfabeto(pregunta.respuesta);
 
                    if (respuestas_final[pregunta.id] === posicion_respuesta) {
                        puntajeCategoria += puntajeMaxPregunta;
                    }
 
                }
 
            }
 
            // Almacena el resultado por categoría en el array
            resultados.push({
                puntaje: puntajeCategoria,
                categoria_id: configuracionCategoria.categoria_id,
                inscripcion_id: inscripcionId
            });
 
 
        }

 
    }
 
    // Registramos los resultados en la base de datos
    await Resultado.bulkCreate(resultados);

}


export default calcularResultado;