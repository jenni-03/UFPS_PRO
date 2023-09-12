const Rol = require('../models/Rol');

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
                console.log('Predefined roles created successfully');
            })
            .catch((err) => console.error('Error creating predefined roles', err.message));
    
        }
    
    }).catch((err) => console.error('Error checking roles existence', err.message));


};

module.exports = generateRole;
