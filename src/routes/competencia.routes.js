import {Router} from 'express';

// Importamos las funciones del controlador
import competenciaController from '../controllers/competenciaController.js';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateCompetenceData} from '../schemas/competenceSchema.js'

// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargado de la obtención de todas las competencias activas
// @route GET /api/competencia
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateCompetenceData], competenciaController.getCompetencias);


// @desc Endpoint encargado de la obtención de una competencia por id
// @route GET /api/competencia/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateCompetenceData], competenciaController.getCompetenciaById);


// @desc Endpoint encargado de la obtención de las categorias activas asociadas a una competencia
// @route GET /api/competencia/:id/categorias
// @access solo Admin
router.get('/:id/categorias', [extractToken, authJWT, isAdmin, validateCompetenceData], competenciaController.getCategoriasCompetencia);


// @desc Endpoint encargado de la creación de una competencia
// @route POST /api/competencia/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateCompetenceData], competenciaController.createCompetencia);


// @desc Endpoint encargado de la actualización de una competencia
// @route POST /api/competencia/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateCompetenceData], competenciaController.updateCompetencia);

// Exportamos el router
export default router;