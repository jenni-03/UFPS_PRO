import Convocatoria from "../models/Convocatoria.js";
import Prueba from "../models/Prueba.js";
import Inscripcion from "../models/Inscripcion.js";
import Resultado from "../models/Resultado.js";
import Categoria from "../models/Categoria.js";
import ConfiguracionCategoria from "../models/ConfiguracionCategoria.js";


/* --------- getResultadoEstudiante function -------------- */

const getResultadoEstudiante = async (req, res, next) => {

    try{ 

        // Obtenemos el identificador del usuario
        const userId = req.user.id;

        // Obtenemos el id de la convocatoria donde obtendremos los resultados
        const { id } = req.params;

        // Obtenemos los datos de la prueba del usuario mediante la inscripcion asociada a la convocatoria
        const inscripcion = await Inscripcion.findOne({
            where: {
                usuario_id: userId,
                convocatoria_id: id
            },
            include: [
                {
                    model: Convocatoria,
                    include: {
                        model: Prueba,
                        attributes: ['nombre', 'puntaje_total'],
                        include: {
                            model: ConfiguracionCategoria,
                            attributes: ['valor_categoria'],
                            include: {
                                model: Categoria,
                                attributes: ['id', 'nombre']
                            }
                        }
                    }
                },
                {
                    model: Resultado,
                    attributes: ['puntaje', 'categoria_id']
                }
            ]
        });

        // Verificamos la existencia de la inscripcion
        if (!inscripcion) {
            return res.status(400).json({ error: 'No se encuentra ninguna inscripción a la convocatoria especificada' });
        }

       // Creamos un mapa de resultados por id de categoría
        const resultadosMap = inscripcion.Resultados.reduce((map, resultado) => {
            map[resultado.categoria_id] = resultado;
            return map;
        }, {});

        // Organizamos los resultados por categoría
        const resultadosPorCategoria = inscripcion.Convocatoria.Prueba.Configuraciones_categorias.map(configuracionCategoria => {
            const resultado = resultadosMap[configuracionCategoria.Categoria.id];
            return {
                nombre_categoria: configuracionCategoria.Categoria.nombre,
                valor_categoria: configuracionCategoria.valor_categoria,
                puntaje: resultado ? resultado.puntaje : 0
            };
        });

        res.status(200).json({
            nombre_prueba: inscripcion.Convocatoria.Prueba.nombre,
            puntaje_total_prueba: inscripcion.Convocatoria.Prueba.puntaje_total,
            resultados: resultadosPorCategoria
        });

    }catch(error){
        const errorGetResEst = new Error(`Ocurrio un problema al obtener el resultado de la prueba - ${error.message}`);
        errorGetResEst.stack = error.stack; 
        next(errorGetResEst);
    }

};


const resultadoController = {

    getResultadoEstudiante

}


export default resultadoController;