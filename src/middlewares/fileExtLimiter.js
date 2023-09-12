const path = require('path');


/** Middleware encargado de verificar las extensiones de los archivos proporcionados */

const fileExtLimiter = (allowedExtArray) => {

    return (req, res, next) => {

        // Obtenemos los archivos
        const files = req.files;

        // Obtenemos las extensiones de los archivos recibidos
        const fileExtensions = [];

        Object.keys(files).forEach(key => {
            fileExtensions.push(path.extname(files[key].name));
        });

        // Determinamos si las extensiones son permitdas
        const allowed = fileExtensions.every(ext => allowedExtArray.includes(ext));

        // Si se encuentra alguna no permitida, respondemos con error
        if(!allowed){

            const message = `Error al cargar el archivo. Unicamente los tipos de archivo ${allowedExtArray.toString()} estan permitidos.`.replaceAll(",", ", ");

            return res.status(400).json({ error: message });

        }

        next();

    }

};

module.exports = fileExtLimiter;