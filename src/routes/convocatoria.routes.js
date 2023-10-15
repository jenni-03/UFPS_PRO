import { Router } from 'express';

// Importamos las funciones del controlador
import convocatoriaController from '../controllers/convocatoriaController.js';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateConvocatoriaData } from '../schemas/convocatoriaSchema.js';
import fileupload from 'express-fileupload';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la obtención de todas las convocatorias activas
// @route GET /api/convocatoria
// @access solo Admin
router.get('/', [extractToken, verifyJWT, isAdmin], convocatoriaController.getConvocatorias);


// @desc Endpoint encargado de la obtención de una convocatoria por su id
// @route GET /api/convocatoria/:id
// @access solo Admin
router.get('/:id', [extractToken, verifyJWT, isAdmin, validateConvocatoriaData], convocatoriaController.getConvocatoriaById);


// @desc Endpoint encargado de la creación de una nueva convocatoria
// @route POST /api/convocatoria/create
// @access solo Admin
router.post('/create', [
    extractToken, 
    verifyJWT, 
    isAdmin, 
    fileupload(),
    filePayloadExist,
    fileExcelLimiter('.xlsx'),
    fileSizeLimiter, 
    validateConvocatoriaData], convocatoriaController.createConvocatoria);


// @desc Endpoint encargado de la actualización de una convocatoria por su id
// @route PUT /api/convocatoria/update/:id
// @access solo Admin
router.put('/update/:id', [ extractToken, verifyJWT, isAdmin, validateConvocatoriaData], convocatoriaController.updateConvocatoria);


// @desc Endpoint encargado de la presentación de la prueba asociada a la convocatoria
// @route PUT /api/convocatoria/:id/presentarPrueba
// @access public
router.post('/:id/presentarPrueba', [ extractToken, verifyJWT ], convocatoriaController.presentarPrueba);


// @desc Endpoint encargado de la obtención de todos los estudiantes asociados a una convocatoria
// @route PUT /api/convocatoria/:id/getEstudiantes
// @access solo Admin
router.get('/:id/getEstudiantes', [ extractToken, verifyJWT, isAdmin ], convocatoriaController.getEstudiantesConvocatoria);


// @desc Endpoint encargado de la obtención de todos las preguntas asociadas a la prueba de una convocatoria
// @route PUT /api/convocatoria/:id/getPreguntas
// @access solo Admin
router.get('/:id/getPreguntas', [ extractToken, verifyJWT, isAdmin ], convocatoriaController.getPreguntasConvocatoria);

export default router;