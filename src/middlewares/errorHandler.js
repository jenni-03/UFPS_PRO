//const {logEvents} = require('./logger');
//const multer = require('multer');


// Middleware encargado del manejo de errores
const errorHandler = (err, req, res, next) => {

    /*if (err instanceof multer.MulterError) {

        // Error de Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido.' });
        }

        // Otros errores de Multer
        return res.status(400).json({ error: `Error al cargar el archivo: ${err}` });

    }*/
    
    if (err) {

        req.log.error(err.stack);

        // Definimos el error a mostrar
        const status = err.status || 500;

        res.status(status);

        res.json({error: err.message});

    }

    next();

};


export default errorHandler;