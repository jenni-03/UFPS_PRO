
/** Limite de tamaño */
const MB = 3;
const FILE_SIZE_LIMIT = 3 * 1024 * 1024;


/** Middleware encargado de verificar que todos los archivos se encuentren dentro de los limites */

const fileSizeLimiter = (req, res, next) => {

    // Obtenemos el archivo
    const file = req.file;

    // Determinamos si el tamaño sobrepasa el limite especificado
    if(file.size > FILE_SIZE_LIMIT){

        const sentence = `Error al cargar el archivo. ${file.originalname} esta por encima del limite de los ${MB} MB.`;

        return res.status(400).json({ error: sentence });

    }

    next();

};

export default fileSizeLimiter;