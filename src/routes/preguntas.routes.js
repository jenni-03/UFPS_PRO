const {Router} = require('express');
const path = require('path');
const multer = require('multer');


// Middleware
const fileupload = require('express-fileupload');
const verifyJWT = require('../middlewares/verifyJWT');
const isAdmin = require('../middlewares/isAdmin');
const fileSizeLimiter = require('../middlewares/fileSizeLimiter');
const fileExtLimiter = require('../middlewares/fileExtLimiter');
const filePayloadExist = require('../middlewares/filePayloadExist');

// Importamos las funciones del controlador
const questionController = require('../controllers/questionController');
const { throws } = require('assert');

// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargada de mostrar todas las preguntas almacenadas que esten activas
// @route GET /api/question
// @access solo Admin
router.get('/', [verifyJWT, isAdmin], questionController.getAllQuestions);


// @desc Endpoint encargada de la creación de una pregunta simple
// @route POST /api/question/createQuestion
// @access solo Admin
router.post('/createQuestion', [verifyJWT, isAdmin], questionController.createQuestion);


// @desc Endpoint encargada de la creación de preguntas por medio de un archivo
// @route POST /api/question/createQuestionFile
// @access solo Admin
router.post('/createQuestionFile', [
    verifyJWT, 
    isAdmin, 
    fileupload(),
    filePayloadExist,
    fileExtLimiter(['.xlsx']),
    fileSizeLimiter], questionController.createQuestions);


// Storage de multer
const multerStorage = multer.diskStorage({

    destination: (req, file, cb) => {

        const filePath = path.resolve(__dirname, '../public/questions');
        cb(null, filePath);

    },
    filename: (req, file, cb) => {

        // Obtenemos la extensión del archivo
        const fileExtension = path.extname(file.originalname); 

        // Creamos el nombre del archivo 
        const mili = Date.now();
        const fileName = `pregunta-${mili}${fileExtension}`;
        cb(null, fileName);

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

// @desc Endpoint encargada de la creación de una pregunta con imagen
// @route POST /api/question/createImageQuestion
// @access solo Admin
router.post('/createImageQuestion', [verifyJWT, isAdmin, upload.single("imagen")], questionController.createImageQuestion);


// @desc Endpoint encargado de la obtención de una pregunta por su id
// @route GET /api/question/:id
// @access solo Admin
router.get('/:id', [verifyJWT, isAdmin], questionController.getQuestionById);


// @desc Endpoint encargado de la actualización de una pregunta por su id
// @route PUT /api/question/update/:id
// @access solo Admin
router.put('/update/:id', [verifyJWT, isAdmin, upload.single("imagen")], questionController.actualizarPregunta);


// Importamos el router
module.exports = router;