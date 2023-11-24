import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


/**
 * Función encargada de subir una nueva imagen al almacenamiento en la nube
 * @param {string} filePath correspondiente a la ruta donde se encuentra almacenado el archivo
 * @param {string} fileName correspondiente al nombre con el que el archivo fue almacenado
 * @returns object con las propiedades del archivo subido
 */
export const uploadImage = async (filePath, fileName) => {

    return cloudinary.uploader.upload(filePath, {
        folder: 'ufps_pro',
        public_id: fileName
    });

};


/**
 * Función encargada de actualizar una imagen ya subida al almacenamiento en la nube
 * @param {string} filePath correspondiente a la ruta donde se encuentra almacenado el archivo
 * @param {string} publicId 
 * @returns 
 */
export const updateFile = async (filePath, publicId) => {

    return cloudinary.uploader.upload(filePath, {
        public_id: publicId
    });

}