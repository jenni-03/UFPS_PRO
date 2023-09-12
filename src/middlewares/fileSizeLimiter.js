
/** Limite de tamaño */
const MB = 4;
const FILE_SIZE_LIMIT = 4 * 1024 * 1024;


/** Middleware encargado de verificar que todos los archivos se encuentren dentro de los limites */

const fileSizeLimiter = (req, res, next) => {

    // Obtenemos los archivos
    const files = req.files;

    // Creamos un arreglo donde almacenaremos los archivos fuera del limite
    const filesOverLimit = [];

    // Buscamos aquellos archivos fuera de los limites
    Object.keys(files).forEach(key => {
        if(files[key].size > FILE_SIZE_LIMIT){
            filesOverLimit.push(files[key].name);
        }
    });

    // Si se encontraron archivos devuelvo error
    if(filesOverLimit.length){

        const sentence = `Error al cargar el archivo. ${filesOverLimit.toString()} esta por encima del limite de los ${MB} MB.`.replaceAll(",", ", ");

        return res.status(400).json({ error: sentence });

    }

    next();

};

module.exports = fileSizeLimiter;