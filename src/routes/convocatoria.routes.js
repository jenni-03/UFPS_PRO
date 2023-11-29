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
import { validateStudentData } from '../schemas/userSchema.js';

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la obtención de todas las convocatorias activas
// @route GET /api/convocatoria
// @access solo Admin
router.get('/', [extractToken, verifyJWT, isAdmin], convocatoriaController.getConvocatorias);


// @desc Endpoint encargado de la obtención de una convocatoria por su id
// @route GET /api/convocatoria/get/:id
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


// @desc Endpoint encargado de la obtención de todos los estudiantes asociados a una convocatoria
// @route GET /api/convocatoria/:id/getEstudiantes
// @access solo Admin
router.get('/:id/getEstudiantes', [ extractToken, verifyJWT, isAdmin ], convocatoriaController.getEstudiantesConvocatoria);


// @desc Endpoint encargado de la presentación de la prueba asociada a la convocatoria
// @route PUT /api/convocatoria/:id/presentarPrueba
// @access public
router.post('/:id/presentarPrueba', [ extractToken, verifyJWT ], convocatoriaController.presentarPrueba);


// @desc Endpoint encargado de la obtención de todos las preguntas asociadas a la prueba de una convocatoria
// @route GET /api/convocatoria/:id/getPreguntas
// @access solo Admin
router.get('/:id/getPreguntas', [ extractToken, verifyJWT ], convocatoriaController.getPreguntasConvocatoria);


// @desc Endpoint encargado de la expulsión de un usuario asociado a una convocatoria especifica
// @route DELETE /api/convocatoria/:conv_id/ejectStudent/:user_id
// @access solo Admin
router.delete('/:conv_id/ejectStudent/:user_id', [ extractToken, verifyJWT, isAdmin ], convocatoriaController.expulsarEstudianteConvocatoria);


// @desc Endpoint encargado de la obtención de todos los estudiantes asociados a una convocatoria
// @route GET /api/convocatoria/:id/getEstudiantes
// @access solo Admin
router.get('/:id/getEstudiantes', [ extractToken, verifyJWT, isAdmin ], convocatoriaController.getEstudiantesConvocatoria);


// @desc Endpoint encargado de la creación de un nuevo estudiante ligado a una convocatoria
// @route POST /api/convocatoria/:id/registroEstudiante
// @access solo Admin
router.post('/:id/registroEstudiante', [ extractToken, verifyJWT, isAdmin, validateStudentData ], convocatoriaController.createStudent);


// ########### Estudiante ################

// @desc Endpoint encargado de la presentación de la prueba asociada a la convocatoria
// @route POST /api/convocatoria/:id/presentarPrueba
// @access Estudiantes
router.post('/:id/presentarPrueba', [ extractToken, verifyJWT ], convocatoriaController.presentarPrueba);


// @desc Endpoint encargado de la terminación de la prueba asociada a la convocatoria
// @route POST /api/convocatoria/:id/terminarPrueba
// @access Estudiantes
router.post('/:id/terminarPrueba', [ extractToken, verifyJWT ], convocatoriaController.terminarPrueba);


// @desc Endpoint encargado de la obtención de todas las convocatorias activas asociadas a un estudiante
// @route GET /api/convocatoria/obtenerConvocatorias/estudiante
// @access Estudiantes
router.get('/obtenerConvocatorias/estudiante', [ extractToken, verifyJWT ], convocatoriaController.getConvocatoriasEstudiante);

export default router;