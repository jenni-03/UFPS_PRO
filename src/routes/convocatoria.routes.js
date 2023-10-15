import { Router } from 'express';

// Importamos las funciones del controlador
import convocatoriaController from '../controllers/convocatoriaController.js';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
const fileupload = require('express-fileupload');

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
router.get('/:id', [extractToken, verifyJWT, isAdmin], convocatoriaController.getConvocatoriaById);


// @desc Endpoint encargado de la creación de una nueva convocatoria
// @route POST /api/convocatoria/create
// @access solo Admin
router.post('/create', [authJWT, isAdmin, fileupload()], convocatoriaController.createConvocatoria);


// @desc Endpoint encargado de la actualización de una convocatoria por su id
// @route PUT /api/convocatoria/update/:id
// @access solo Admin
router.put('/update/:id', [authJWT, isAdmin], convocatoriaController.updateConvocatoria);


// @desc Endpoint encargado de la presentación de la prueba asociada a la convocatoria
// @route PUT /api/convocatoria/:id/presentarPrueba
// @access public
router.post('/:id/presentarPrueba', [authJWT], convocatoriaController.presentarPrueba);


// @desc Endpoint encargado de la obtención de todos los estudiantes asociados a una convocatoria
// @route PUT /api/convocatoria/:id/getEstudiantes
// @access solo Admin
router.get('/:id/getEstudiantes', [authJWT, isAdmin], convocatoriaController.getEstudiantesConvocatoria);


// @desc Endpoint encargado de la obtención de todos las preguntas asociadas a la prueba de una convocatoria
// @route PUT /api/convocatoria/:id/getPreguntas
// @access solo Admin
router.get('/:id/getPreguntas', [authJWT, isAdmin], convocatoriaController.getPreguntasConvocatoria);

module.exports = router;