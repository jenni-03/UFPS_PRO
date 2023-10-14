import { Router } from 'express';

// Importamos las funciones del controlador
import testController from '../controllers/pruebaController.js';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateTestData } from '../schemas/testSchema.js';

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la obtención de todas las pruebas activas
// @route GET /api/prueba
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateTestData], testController.getAllTests);


// @desc Endpoint encargado de la obtención de una prueba por su id
// @route GET /api/prueba/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateTestData], testController.getTestId);


// @desc Endpoint encargado de la creación de una nueva prueba
// @route POST /api/prueba/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateTestData], testController.createTest);


// @desc Endpoint encargado de la actualización de una prueba por su id
// @route PUT /api/prueba/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateTestData], testController.updateTest);


// Exportamos el router
export default router;