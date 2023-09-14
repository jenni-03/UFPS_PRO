import Rol from '../models/Rol.js';
import logger from '../middlewares/logger.js';

// Verificar si los roles ya existen en la BD
const generateRole = () => {

    Rol.findAndCountAll().then(result => {

        const count = result.count;
    
        if(count === 0) {
    
            // Definimos los roles a insertar
            const predefinedRoles = [
                {nombre: 'Administrador'},
                {nombre: 'Estudiante'}
            ];
    
    
            // Creamos los roles
            Rol.bulkCreate(predefinedRoles).then(() => {
                logger.info('Roles predefinidos creados correctamente');
            })
            .catch((err) => logger.error(`Error al crear roles predefinidos: ${err.message}`));
    
        }
    
    }).catch((err) => logger.error(`Error al verificar roles existentes: ${err.message}`));


};

export default generateRole;
