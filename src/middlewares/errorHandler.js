import multer from "multer";
import { ConnectionTimedOutError } from "sequelize";

// Middleware encargado del manejo de errores
const errorHandler = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        req.log.warn(err, `Error inesperado durante la carga de archivo: ${err.message}`);
        res.status(400).json({ error: `Error al intentar cargar el archivo, intentelo nuevamente` });

    }

    else if (err instanceof ConnectionTimedOutError){

        req.log.warn(err, `El pool de cinexiones se ha agotado: ${err.message}`);
        res.status(503).json({ error: 'El servicio no está disponible temporalmente debido a la alta demanda. Inténtalo más tarde.' });

    }

    else if (res.statusCode === 400){
        res.json({error: err.message});
    }
    
    else if (err) {

        req.log.error(err, `Error inesperado en la aplicacion: ${err.message}`);

        // Definimos el error a mostrar
        const status = err.status || 500;

        res.status(status);

        res.json({error: err.message});

    }

    next();

};


export default errorHandler;