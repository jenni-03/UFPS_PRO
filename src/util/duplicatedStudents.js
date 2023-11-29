
/**
 * Función encargada de verificar si se encuentran codigos o correos repetidos en el conjunto de estudiantes
 * @param {object[]} estudiantes 
 * @returns boolean
 */
export const tieneDuplicados = (estudiantes) => {

    let codigos = {};
    let emails = {};

    for (let estudiante of estudiantes) {

        if (codigos[estudiante.Codigo]) {
            return true;
        } else {
            codigos[estudiante.Codigo] = true;
        }
    
        if (emails[estudiante.Email]) {
            return true;
        } else {
            emails[estudiante.Email] = true;
        }

    }

    return false;

}
