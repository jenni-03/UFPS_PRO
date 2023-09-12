//const {logEvents} = require('./logger');
const multer = require('multer');


// Middleware encargado del manejo de errores
const errorHandler = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        // Error de Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido.' });
        }

        // Otros errores de Multer
        return res.status(400).json({ error: `Error al cargar el archivo: ${err}` });

    } else if (err) {
        
        // Definimos el contenido del log
        //logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');

        console.error(err.stack);

        // Definimos el error a mostrar
        const status = res.statusCode ? res.statusCode : 500;

        res.status(status);

        res.json({error: err.message});

    }

    next();

};


module.exports = {
    errorHandler
}