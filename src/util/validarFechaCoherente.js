const moment = require('moment-timezone');

/** Función encargada de validar la coherencia de las fechas manejadas por el software */
function validarFechaCoherente(fecha_inicio, fecha_fin) {

    const fechaActual = moment().tz('America/Bogota');
    const fecha_inicio_format = moment.tz(fecha_inicio, 'America/Bogota');
    const fecha_fin_format = moment.tz(fecha_fin, 'America/Bogota');

    if (fecha_inicio_format.isBefore(fechaActual)) {
        return 'La fecha de inicio de la convocatoria no es coherente';
    }

    if(fecha_fin_format.isBefore(fechaActual)) {
        return 'La fecha de fin de la convocatoria no es coherente';
    }

    if(fecha_inicio_format.isAfter(fecha_fin_format) || fecha_inicio_format.isSame(fecha_fin_format)) {
        return 'La fecha de inicio de la convocatoria no puede ser mayor o igual que la de fin';
    }
  
    return null;

}

module.exports = {
    validarFechaCoherente
}
  