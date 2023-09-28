
/** Middleware encargado de verificar las extensiones de los archivos proporcionados */

const fileExtLimiter = (allowedMymetypes) => {

    return (req, res, next) => {

        // Obtenemos el mymetype del archivo
        const fileType = req.file.mimetype;

        // Determinamos si el archivo es permitido
        const allowed = allowedMymetypes.includes(fileType);

        // Si no es permitido, respondemos con error
        if(!allowed){

            const message = `Error al cargar el archivo. Unicamente los tipos de archivo ${allowedMymetypes.toString()} estan permitidos.`.replaceAll(",", ", ");

            return res.status(400).json({ error: message });

        }

        next();

    }

};

export default fileExtLimiter;