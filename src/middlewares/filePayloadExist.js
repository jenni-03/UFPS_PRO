
/** Middleware encargado de verificar que se hayan pasado archivos */

const filePayloadExists = (req, res, next) => {

    if(!req.file && !req.files){
        return res.status(400).json({error: "Archivo no proporcionado"});
    }

    next();

};


export default filePayloadExists;