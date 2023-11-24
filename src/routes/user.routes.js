import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import Usuario from '../models/Usuario.js';

// Middleware de verificación de token
import extractToken from '../middlewares/extractToken.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateStudentData, validateDirectorData } from '../schemas/userSchema.js'
import filePayloadExists from '../middlewares/filePayloadExist.js';
import fileExtLimiter from '../middlewares/fileExtLimiter.js';

// Importamos las funciones del controlador
import userController from '../controllers/userController.js';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import limiter from '../middlewares/rateLimit.js';

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la obtención del perfil de cada usuario
// @route GET /api/user/profile
// @access solo Usuarios
router.get('/profile', [ extractToken, verifyJWT ], userController.getProfile);


// @desc Endpoint encargado de la obtención de todos los estudiantes activos
// @route GET /api/user/student
// @access solo Admin
router.get('/student', [ extractToken, verifyJWT, isAdmin, validateStudentData ], userController.getStudents);


// @desc Endpoint encargado de la obtención de un solo estudiante por su id
// @route GET /api/user/student/:id
// @access Estudiante
router.get('/student/:id', [ extractToken, verifyJWT, isAdmin, validateStudentData ], userController.getStudentById);


// @desc Endpoint encargado de la actualización de los datos de contacto de un estudiante por el mismo a partir de su id
// @route PUT /api/user/student/update
// @access Estudiante
router.put('/student/update', [ limiter, extractToken, verifyJWT, validateStudentData ], userController.updateStudentData);


// @desc Endpoint encargado de la actualización de datos de un estudiante por parte del director
// @route PUT /api/user/student/update/:id
// @access solo Admin
router.put('/student/update/:id', [ extractToken, verifyJWT, isAdmin, validateStudentData ], userController.updateStudentDataDir);


// @desc Endpoint encargado de la obtención de todos los directores registrados (incluidos no activos)
// @route GET /api/user/admin
// @access solo Admin
router.get('/admin', [extractToken, verifyJWT, isAdmin], userController.getDirectors);


// @desc Endpoint encargado de la obtención de un unico director por su id
// @route GET /api/user/admin/:id
// @access solo Admin
router.get('/admin/:id', [extractToken, verifyJWT, isAdmin, validateStudentData], userController.getDirectorById);


// @desc Endpoint encargado de la actualización de los datos del director en función
// @route PUT /api/user/admin/update
// @access solo Admin
router.put('/admin/update', [limiter, extractToken, verifyJWT, isAdmin, validateDirectorData], userController.updateDirector);


// Storage de multer
const multerStorage = multer.diskStorage({

    filename: (req, file, cb) => {

        // Obtenemos los datos del usuario
        Usuario.findByPk(req.user.id)
            .then((director) => {

                // Obtenemos la extensión del archivo
                const fileExtension = path.extname(file.originalname);

                // Creamos el nombre del archivo 
                const fileName = `${director.codigo}${fileExtension}`;

                cb(null, fileName);

        }).catch(error => cb(error));

    }

});
const upload = multer({
    storage: multerStorage
});

// @desc Endpoint encargado de la actualización de la foto de perfil del director
// @route PUT /api/user/admin/updatePhoto
// @access solo Admin
router.put('/admin/updatePhoto', [limiter, extractToken, verifyJWT, isAdmin, upload.single('avatar'), filePayloadExists, fileExtLimiter(["image/jpeg", "image/png"]), fileSizeLimiter], userController.updatePhotoDirector);


// @desc Endpoint encargado de la actualización de la contraseña de un usuario
// @route PUT /api/user/updatePassword
// @access solo Usuarios
router.put('/updatePassword', [limiter, extractToken, verifyJWT], userController.updatePassword);


// @desc Endpoint encargado de la desvinculación de un estudiante de la plataforma
// @route DELETE /api/user/deleteStudent/:id
// @access solo Admin
router.delete('/deleteStudent/:id', [extractToken, verifyJWT, isAdmin], userController.deleteStudent);


// Importamos el router
export default router;