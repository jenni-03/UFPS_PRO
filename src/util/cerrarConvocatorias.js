import Convocatoria from "../models/Convocatoria";
import moment from "moment";
import { Op } from 'sequelize';
import logger from "../middlewares/logger";
import Inscripcion from "../models/Inscripcion";


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

                await Promise.all([
                    convocatoria.update({ estado: 0 }),
                    Inscripcion.update({ estado: 0 }, {
                        where: {
                            convocatoria_id: convocatoria.id
                        }
                    })
                ]);

                // Calcular resultados
                
                // Aquí puedes implementar notificaciones a estudiantes o administradores si es necesario
                logger.info(`Convocatoria cerrada automaticamente: ${convocatoria.nombre}`);

            }

        }


    } catch (error) {
      logger.error('Error al cerrar convocatorias automáticamente:', error);
    }

};


export default cerrarConvocatoriasVencidas;
  