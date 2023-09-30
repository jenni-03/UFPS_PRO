import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export const uploadImage = async (filePath, fileName) => {

    return cloudinary.uploader.upload(filePath, {
        folder: 'ufps_pro',
        public_id: fileName
    });

};

export const updateFile = async (filePath, publicId) => {

    return cloudinary.uploader.upload(filePath, {
        public_id: publicId
    });

}