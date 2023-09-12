const {Router} = require('express');

// Importamos las funciones del controlador
const pruebaController = require('../controllers/pruebaController');

// Importamos los middlewares de autenticación
const authJWT = require('../middlewares/verifyJWT');
const isAdmin = require('../middlewares/isAdmin');

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la obtención de todas las pruebas activas
// @route GET /api/prueba
// @access solo Admin
router.get('/', [authJWT, isAdmin], pruebaController.getPruebas);


// @desc Endpoint encargado de la obtención de una prueba por su id
// @route GET /api/prueba/:id
// @access solo Admin
router.get('/:id', [authJWT, isAdmin], pruebaController.getPruebasId);


// @desc Endpoint encargado de la creación de una nueva prueba
// @route POST /api/prueba/create
// @access solo Admin
router.post('/create', [authJWT, isAdmin], pruebaController.createPrueba);


// @desc Endpoint encargado de la actualización de una prueba por su id
// @route PUT /api/prueba/update/:id
// @access solo Admin
router.put('/update/:id', [authJWT, isAdmin], pruebaController.updatePrueba);


// Exportamos el router
module.exports = router;