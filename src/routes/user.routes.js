const {Router} = require('express');
const multer = require('multer');
const path = require('path');
const Usuario = require('../models/Usuario');

// Middleware de verificación de token
const verifyJWT = require('../middlewares/verifyJWT');
const isAdmin = require('../middlewares/isAdmin');

// Importamos las funciones del controlador
const userController = require('../controllers/userController');

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la creación de un nuevo estudiante
// @route POST /api/user/student/create
// @access solo Admin
router.post('/student/create', [verifyJWT, isAdmin], userController.createStudent);


// @desc Endpoint encargado de la obtención de todos los estudiantes activos
// @route GET /api/user/student
// @access solo Admin
router.get('/student', [verifyJWT, isAdmin], userController.getStudents);


// @desc Endpoint encargado de la obtención de un solo estudiante por su id
// @route GET /api/user/student/:id
// @access Estudiante
router.get('/student/:id', verifyJWT, userController.getStudentById);


// @desc Endpoint encargado de la actualización de los datos de contacto de un estudiante por el mismo a partir de su id
// @route PUT /api/user/student/update/:id
// @access Estudiante
router.put('/student/update/:id', verifyJWT, userController.updateStudentData);


// @desc Endpoint encargado de la actualización de datos de un estudiante por parte del director
// @route PUT /api/user/student/updateDir/:id
// @access solo Admin
router.put('/student/updateDir/:id', [verifyJWT, isAdmin], userController.updateStudentDataDir);


// @desc Endpoint encargado de la obtención de todos los directores registrados (incluidos no activos)
// @route GET /api/user/admin
// @access solo Admin
router.get('/admin', [verifyJWT, isAdmin], userController.getDirectors);


// @desc Endpoint encargado de la obtención de un unico director por su id
// @route GET /api/user/admin/:id
// @access solo Admin
router.get('/admin/:id', [verifyJWT, isAdmin], userController.getDirectorById);


// @desc Endpoint encargado de la actualización de los datos del director
// @route PUT /api/user/admin/update/:id
// @access solo Admin
router.put('/admin/update/:id', [verifyJWT, isAdmin], userController.updateDirector);


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
module.exports = router;