const {Router} = require('express');

// Importamos las funciones del controlador
const competenciaController = require('../controllers/competenciaController');

// Importamos los middlewares de autenticación
const authJWT = require('../middlewares/verifyJWT');
const isAdmin = require('../middlewares/isAdmin');

// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargado de la obtención de todas las competencias activas
// @route GET /api/competencia
// @access solo Admin
router.get('/', [authJWT, isAdmin], competenciaController.getCompetencias);


// @desc Endpoint encargado de la obtención de una competencia por id
// @route GET /api/competencia/:id
// @access solo Admin
router.get('/:id', [authJWT, isAdmin], competenciaController.getCompetenciaById);


// @desc Endpoint encargado de la obtención de las categorias activas asociadas a una competencia
// @route GET /api/competencia/:id/categorias
// @access solo Admin
router.get('/:id/categorias', [authJWT, isAdmin], competenciaController.getCategoriasCompetencia);


// @desc Endpoint encargado de la creación de una competencia
// @route POST /api/competencia/create
// @access solo Admin
router.post('/create', [authJWT, isAdmin], competenciaController.createCompetencia);


// @desc Endpoint encargado de la actualización de una competencia
// @route POST /api/competencia/update/:id
// @access solo Admin
router.put('/update/:id', [authJWT, isAdmin], competenciaController.updateCompetencia);

// Exportamos el router
module.exports = router;