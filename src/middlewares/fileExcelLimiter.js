import path from 'node:path';

/** Middleware encargado de verificar la extensión del archivo excel */

const fileExcelLimiter = (extension) => {

    return (req, res, next) => {

        // Obtenemos el archivo
        const file = req.files.archivo;

        // Obtenemos la extensión
        const ext = path.extname(file.name); 

        // Determinamos las si las extensiones coinciden
        if (extension !== ext){

            const message = `Error al cargar el archivo. Unicamente el tipo de archivo ${extension} esta permitido.`;

            return res.status(400).json({ error: message });

        }

        next();

    }

}

export default fileExcelLimiter;