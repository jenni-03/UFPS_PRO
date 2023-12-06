import Convocatoria from "../models/Convocatoria.js";
import moment from "moment";
import { Op } from 'sequelize';
import logger from "../middlewares/logger.js";
import Inscripcion from "../models/Inscripcion.js";
import calcularResultado from "./CalcularResultados.js";


/**
 * Función encargada de realizar el cierre automático de toda convocatoria cuya fecha de finalización haya sido alcanzada
 */
const cerrarConvocatoriasVencidas = async () => {

    try {

        const currentDate = moment().tz('America/Bogota');
        
        // Busca todas las convocatorias con fecha de fin menor o igual a la fecha actual
        const convocatoriasAVencer = await Convocatoria.findAll({

            where: {
                fecha_fin: { [Op.lte]: currentDate },
                estado: 1,
            },

        });

        if (convocatoriasAVencer.length === 0){

            logger.info('Todo bien el dia de hoy, no hay convocatorias por cerrar');

        }else{

            // Actualiza el estado de la convocatoria a "cerrada" y Deshabilitamos todas las inscripciones asociadas a esa convocatoria
            for (const convocatoria of convocatoriasAVencer) {

                
                await convocatoria.update({ estado: 0 });

                await Inscripcion.update({ estado: 0 }, {
                    where: {
                        convocatoria_id: convocatoria.id
                    }
                })
                

                // Calcular resultados
                const prueba = await convocatoria.getPrueba();

                const inscripciones = await Inscripcion.findAll({
                    where: {
                        convocatoria_id: convocatoria.id
                    },
                    include: [{
                        model: Resultado,
                        as: 'Resultados'
                    }]
                });

                // Crear un array para almacenar todas las promesas
                let promesas = [];

                for (let inscripcion of inscripciones){
                    // Verificamos si para la inscripción ya se generaron los resultados
                    if (inscripcion.Resultados.length === 0){
                        // Agregar la promesa al array
                        promesas.push(calcularResultado(prueba.id, inscripcion.id));
                    }
                }

                // Esperar a que todas las promesas se resuelvan
                await Promise.all(promesas);
                
                // Aquí puedes implementar notificaciones a estudiantes o administradores si es necesario
                logger.info(`Convocatoria cerrada automaticamente: ${convocatoria.nombre}`);

            }

        }


    } catch (error) {
      logger.error('Error al cerrar convocatorias automáticamente:', error);
    }

};


export default cerrarConvocatoriasVencidas;
  