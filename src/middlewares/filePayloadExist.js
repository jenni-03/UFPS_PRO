
/** Middleware encargado de verificar que se hayan pasado archivos */

const filesPayloadExists = (req, res, next) => {

    if(!req.files){
        return res.status(400).json({error: "Archivo no proporcionado"});
    }

    next();

};


module.exports = filesPayloadExists;