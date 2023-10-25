import moment from 'moment';

/**
 * Función encargada de validar la coherencia de las fechas manejadas por el software
 * @param {Date} fecha_inicio 
 * @param {Date} fecha_fin 
 * @returns string
 */
export function validarFechaCoherente(fecha_inicio, fecha_fin) {


    // Zona horaria a trabajar
    const format = 'YYYY-MM-DD HH:mm';

    // Fechas a comparar
    const fechaActual = moment().local();
    const fecha_inicio_format = moment(fecha_inicio, format).local();
    const fecha_fin_format = moment(fecha_fin, format).local();

    if (fecha_inicio_format.isBefore(fechaActual)) {
        return 'La fecha de inicio de la convocatoria no es coherente';
    }

    if(fecha_fin_format.isBefore(fechaActual)) {
        return 'La fecha de fin de la convocatoria no es coherente';
    }

    if(fecha_inicio_format.isSameOrAfter(fecha_fin_format)) {
        return 'La fecha de inicio de la convocatoria no puede ser mayor o igual que la de fin';
    }
  
    return null;

}

