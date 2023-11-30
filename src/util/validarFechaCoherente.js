import moment from 'moment';

/**
 * Función encargada de validar la coherencia de las fechas manejadas por el software
 * @param {Date} fecha_inicio 
 * @param {Date} fecha_fin 
 * @returns string
 */
export function validarFechaCoherente(fecha_inicio, fecha_fin) {

    console.log(fecha_inicio.utcOffset(-5));
    console.log(fecha_fin.utcOffset(-5));


    // Fechas a comparar
    const fechaActual = moment().tz('America/Bogota');

    console.log(fechaActual);

    if (fecha_inicio.isBefore(fechaActual)) {
        return 'La fecha de inicio de la convocatoria no es coherente';
    }

    if(fecha_fin.isBefore(fechaActual)) {
        return 'La fecha de fin de la convocatoria no es coherente';
    }

    if(fecha_inicio.isSameOrAfter(fecha_fin)) {
        return 'La fecha de inicio de la convocatoria no puede ser mayor o igual que la de fin';
    }
  
    return null;

}

