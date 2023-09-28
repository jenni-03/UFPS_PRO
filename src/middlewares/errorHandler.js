import multer from "multer";


// Middleware encargado del manejo de errores
const errorHandler = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        req.log.warn(err.stack);
        return res.status(400).json({ error: `Error de carga de archivo: ${err.message}` });

    }
    
    else if (err) {

        req.log.error(err.stack);

        // Definimos el error a mostrar
        const status = err.status || 500;

        res.status(status);

        res.json({error: err.message});

    }

    next();

};


export default errorHandler;