const {Router} = require('express');

// Importamos las funciones del controlador
const categoriaController = require('../controllers/categoriaController');

// Importamos los middlewares de autenticación
const authJWT = require('../middlewares/verifyJWT');
const isAdmin = require('../middlewares/isAdmin');

// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargado de la obtención de todas las categorias activas
// @route GET /api/categoria
// @access solo Admin
router.get('/', [authJWT, isAdmin], categoriaController.getCategorias);


// @desc Endpoint encargado de la obtención de una categoria por Id
// @route GET /api/categoria/:id
// @access solo Admin
router.get('/:id', [authJWT, isAdmin], categoriaController.getCategoriaById);


// @desc Endpoint encargado de la creación de una categoria
// @route POST /api/categoria/create
// @access solo Admin
router.post('/create', [authJWT, isAdmin], categoriaController.createCategoria);


// @desc Endpoint encargado de la actualización de una categoria dado su id 
// @route PUT /api/categoria/update/:id
// @access solo Admin
router.put('/update/:id', [authJWT, isAdmin], categoriaController.updateCategoria);

// Exportamos el router
module.exports = router;