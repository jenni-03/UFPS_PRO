import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import Usuario from '../models/Usuario.js';

// Middleware de verificación de token
import extractToken from '../middlewares/extractToken.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateStudentData } from '../schemas/userSchema.js'

// Importamos las funciones del controlador
import userController from '../controllers/userController.js';

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la creación de un nuevo estudiante
// @route POST /api/user/student/create
// @access solo Admin
router.post('/student/create', [ extractToken, verifyJWT, isAdmin, validateStudentData ], userController.createStudent);


// @desc Endpoint encargado de la obtención de todos los estudiantes activos
// @route GET /api/user/student
// @access solo Admin
router.get('/student', [ extractToken, verifyJWT, isAdmin, validateStudentData ], userController.getStudents);


// @desc Endpoint encargado de la obtención de un solo estudiante por su id
// @route GET /api/user/student/:id
// @access Estudiante
router.get('/student/:id', [ extractToken, verifyJWT, isAdmin, validateStudentData ], userController.getStudentById);


// @desc Endpoint encargado de la actualización de los datos de contacto de un estudiante por el mismo a partir de su id
// @route PUT /api/user/student/update/:id
// @access Estudiante
router.put('/student/update', [ extractToken, verifyJWT, validateStudentData ], userController.updateStudentData);


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
router.get('/admin/:id', [extractToken, verifyJWT, isAdmin], userController.getDirectorById);


// @desc Endpoint encargado de la actualización de los datos del director
// @route PUT /api/user/admin/update/:id
// @access solo Admin
router.put('/admin/update', [extractToken, verifyJWT, isAdmin], userController.updateDirector);


// Storage de multer
const multerStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        const filePath = path.resolve(__dirname, '../public/directors');
        cb(null, filePath);
    },
    filename: (req, file, cb) => {

        // Obtenemos los datos del usuario
        Usuario.findOne({
            where: {
                email: req.user.username
            }
        }).then((director) => {

            // Obtenemos la extensión del archivo
            const fileExtension = path.extname(file.originalname);

            // Creamos el nombre del archivo 
            const fileName = `${director.documento}${fileExtension}`;

            cb(null, fileName);

        }).catch(error => cb(error));

    }

});
const upload = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {

        const mymetypes = ["image/jpeg", "image/png"];

        if(mymetypes.includes(file.mimetype)){
            cb(null, true);
        }else{
            cb(new Error(`Solo se admiten los siguientes mymetypes: ${mymetypes.join(' ')}`), false);
        }

    },
    limits: {
        fileSize: 4 * 1024 * 1024
    }
});

// @desc Endpoint encargado de la actualización de la foto de perfil del director
// @route PUT /api/user/admin/updatePhoto/:id
// @access solo Admin
router.put('/admin/updatePhoto/:id', [verifyJWT, isAdmin, upload.single('avatar')], userController.updatePhotoDirector);


// @desc Endpoint encargado de la actualización de la contraseña de un admin
// @route PUT /api/user/admin/updatePassword
// @access solo Admin
router.put('/admin/updatePassword', [verifyJWT, isAdmin], userController.updatePassword);


// Importamos el router
export default router;