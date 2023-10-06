import { Router} from 'express';
import path from 'node:path';
import multer from 'multer';


// Middleware
import fileupload from 'express-fileupload';
import extractToken from '../middlewares/extractToken.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import fileExtLimiter from '../middlewares/fileExtLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import limiter from '../middlewares/rateLimit.js';
import { validateQuestionData } from '../schemas/questionSchema.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Importamos las funciones del controlador
import questionController from '../controllers/questionController.js';

// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargada de mostrar todas las preguntas almacenadas que esten activas
// @route GET /api/question
// @access solo Admin
router.get('/', [extractToken, verifyJWT, isAdmin, validateQuestionData], questionController.getAllQuestions);


// @desc Endpoint encargada de la creación de una pregunta simple
// @route POST /api/question/create
// @access solo Admin
router.post('/create', [extractToken, verifyJWT, isAdmin, validateQuestionData], questionController.createQuestion);


// @desc Endpoint encargada de la creación de preguntas por medio de un archivo
// @route POST /api/question/createFile
// @access solo Admin
router.post('/createFile', [
    limiter,
    extractToken,
    verifyJWT, 
    isAdmin, 
    fileupload(),
    filePayloadExist,
    fileExcelLimiter('.xlsx'),
    fileSizeLimiter], questionController.createQuestions);


// Storage de multer
const multerStorage = multer.diskStorage({

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
    storage: multerStorage
});

// @desc Endpoint encargada de la creación de una pregunta con imagen
// @route POST /api/question/createImageQuestion
// @access solo Admin
router.post('/createImageQuestion', [limiter, extractToken, verifyJWT, isAdmin, upload.single("imagen"), filePayloadExist, fileExtLimiter(["image/jpeg", "image/png"]), fileSizeLimiter, validateQuestionData], questionController.createImageQuestion);


// @desc Endpoint encargado de la obtención de una pregunta por su id
// @route GET /api/question/:id
// @access solo Admin
router.get('/:id', [extractToken, verifyJWT, isAdmin, validateQuestionData], questionController.getQuestionById);


// @desc Endpoint encargado de la actualización de una pregunta por su id
// @route PUT /api/question/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, verifyJWT, isAdmin, upload.single("imagen"), fileExtLimiter(["image/jpeg", "image/png"]), fileSizeLimiter, validateQuestionData], questionController.actualizarPregunta);


// Importamos el router
export default router;