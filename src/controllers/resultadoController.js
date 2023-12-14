import Convocatoria from "../models/Convocatoria.js";
import Prueba from "../models/Prueba.js";
import Inscripcion from "../models/Inscripcion.js";
import Resultado from "../models/Resultado.js";
import Categoria from "../models/Categoria.js";
import ConfiguracionCategoria from "../models/ConfiguracionCategoria.js";
import User from "../models/Usuario.js";
import moment from 'moment';
import { Op } from 'sequelize';


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
            return res.status(400).json({ error: 'Usted no posee ninguna inscripción a la convocatoria especificada' });
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


/* --------- getResultadoEstudianteAdmin function -------------- */

const getResultadoEstudianteAdmin = async (req, res, next) => {

    try{ 

        // Obtenemos el identificador del usuario y el id de la convocatoria donde obtendremos los resultados
        const { userId, convocatoriaId  } = req.params;

        // Obtenemos el info del usuario
        const user = await User.findByPk(userId);

        // Obtenemos los datos de la prueba del usuario mediante la inscripcion asociada a la convocatoria
        const inscripcion = await Inscripcion.findOne({
            where: {
                usuario_id: userId,
                convocatoria_id: convocatoriaId
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
            return res.status(400).json({ error: 'El estudiante no posee ninguna inscripción a la convocatoria especificada' });
        }

        // Verificamos que la convocatoria ya haya finalizado
        if (inscripcion.Convocatoria.estado) {
            return res.status(400).json({ error: 'Debe esperar a la finalización de la convocatoria para poder observar los resultados' })
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
            resultados: resultadosPorCategoria,
            userInfo: {
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                codigo: user.codigo,
                semestre: user.semestre
            }
        });

    }catch(error){
        const errorGetResEstAdmin = new Error(`Ocurrio un problema al obtener el resultado de la prueba del usuario - ${error.message}`);
        errorGetResEstAdmin.stack = error.stack; 
        next(errorGetResEstAdmin);
    }

};


/* --------- getMetricasResultadosConvocatoria function -------------- */

const getMetricasResultadosConvocatoria = async (req, res, next) => {

    try{ 

        // Obtenemos el id de la convocatoria donde obtendremos los resultados
        const { id } = req.params;

        const convocatoria = await Convocatoria.findByPk(id);

        if (convocatoria.estado) {

            return res.status(400).json({ error: 'Debe esperar a la finalización de la convocatoria para poder observar sus resultados' })

        }

        // Obtenemos los datos de la prueba del usuario mediante la inscripcion asociada a la convocatoria
        const inscripciones = await Inscripcion.findAll({
            where: {
                convocatoria_id: id
            },
            include: {
                model: Resultado,
                attributes: ['puntaje']
            }
            
        });

        // Verificamos la existencia de la inscripcion
        if (inscripciones.length === 0) {
            return res.status(400).json({ error: 'No se encuentra ninguna inscripción a la convocatoria especificada' });
        }

        // Calculamos los puntajes globales
        const puntajes_globales = [];

        for (let inscripcion of inscripciones){

            puntajes_globales.push(inscripcion.Resultados.reduce((acumulador, resultado) => acumulador + resultado.puntaje, 0));

        }

        // Promedio
        let suma = puntajes_globales.reduce((a, b) => a + b, 0);
        let promedio = suma / puntajes_globales.length;

        // Mediana
        puntajes_globales.sort((a, b) => a - b);
        let mediana;
        if (puntajes_globales.length % 2 === 0) {
            mediana = (puntajes_globales[puntajes_globales.length / 2 - 1] + puntajes_globales[puntajes_globales.length / 2]) / 2;
        } else {
            mediana = puntajes_globales[(puntajes_globales.length - 1) / 2];
        }

        // Moda
        let frecuencias = {};
        for (let puntaje of puntajes_globales) {
            if (frecuencias[puntaje]) {
                frecuencias[puntaje]++;
            } else {
                frecuencias[puntaje] = 1;
            }
        }
        let maxFrecuencia = 0;
        let moda;
        for (let puntaje in frecuencias) {
            if (frecuencias[puntaje] > maxFrecuencia) {
                maxFrecuencia = frecuencias[puntaje];
                moda = puntaje;
            }
        }

        res.status(200).json({
            promedio: promedio,
            mediana: mediana,
            moda: moda
        });

    }catch(error){
        const errorGetMetResConv = new Error(`Ocurrio un problema al obtener las metricas de los resultados de la convocatoria - ${error.message}`);
        errorGetMetResConv .stack = error.stack; 
        next(errorGetMetResConv);
    }

};


/* --------- getResultadosGlobalEstudiante function -------------- */

const getResultadosGlobalEstudiante = async (req, res, next) => {

    try{ 

        // Obtenemos el identificador del usuario
        const userId = req.params.id;

        // Obtenemos las fechas de filtrado para las convocatorias
        let { fecha_inicio, fecha_fin } = req.body;

        // Validamos que la fechas sean coherentes
        const validInicio = moment(fecha_inicio, true).tz('America/Bogota').isValid();
        const validFin = moment(fecha_fin, true).tz('America/Bogota').isValid();

        if (!validInicio|| !validFin) return res.status(400).json({ error: 'Las fechas proporcionadas no poseen un formato valido' });

        fecha_inicio = moment(fecha_inicio).tz('America/Bogota');
        fecha_fin = moment(fecha_fin).tz('America/Bogota');

        if(fecha_inicio.isAfter(fecha_fin)) {
            return res.status(400).json({ error: 'La fecha de inicio del filtro no puede ser mayor que la de fin' });
        }

        // Obtenemos todas las inscripciones del usuario a convocatorias ya finalizadas
        const inscripciones = await Inscripcion.findAll({
            where: {
                usuario_id: userId,
                estado: 0
            },
            include: [
                {
                    model: Convocatoria,
                    attributes: ['nombre'],
                    where: {
                        fecha_fin: {
                            [Op.and]: {
                                [Op.gte]: fecha_inicio,
                                [Op.lte]: fecha_fin
                            }
                        }
                    }
                },
                {
                    model: Resultado,
                    attributes: ['puntaje']
                }
            ]
        });

        // Verificamos la 
        if (inscripciones.length == 0) {
            return res.status(200).json([]);
        }

        // Calculamos los puntajes globales de las pruebas que presento el estudiante
        const resultados_pruebas = [];

        for (let inscripcion of inscripciones){

            const infoPrueba = {
                prueba: '',
                puntaje: 0
            };

            infoPrueba.prueba = inscripcion.Convocatoria.nombre;
            infoPrueba.puntaje = inscripcion.Resultados.reduce((acumulador, resultado) => acumulador + resultado.puntaje, 0);
            resultados_pruebas.push(infoPrueba);

        }

        res.status(200).json(resultados_pruebas);

    }catch(error){
        const errorGetResEstGlobales = new Error(`Ocurrio un problema al obtener los resultados globales del usuario - ${error.message}`);
        errorGetResEstGlobales.stack = error.stack; 
        next(errorGetResEstGlobales);
    }

};


const resultadoController = {

    getResultadoEstudiante,
    getMetricasResultadosConvocatoria,
    getResultadoEstudianteAdmin,
    getResultadosGlobalEstudiante

}


export default resultadoController;