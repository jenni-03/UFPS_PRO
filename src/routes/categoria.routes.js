import {Router} from 'express';

// Importamos las funciones del controlador
import categoriaController from '../controllers/categoriaController.js';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateCategoryData } from '../schemas/categorySchema.js';


// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargado de la obtención de todas las categorias activas
// @route GET /api/categoria
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateCategoryData], categoriaController.getCategorias);


// @desc Endpoint encargado de la obtención de una categoria por Id
// @route GET /api/categoria/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateCategoryData], categoriaController.getCategoriaById);


// @desc Endpoint encargado de la creación de una categoria
// @route POST /api/categoria/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateCategoryData], categoriaController.createCategoria);


// @desc Endpoint encargado de la actualización de una categoria dado su id 
// @route PUT /api/categoria/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateCategoryData], categoriaController.updateCategoria);


// Exportamos el router
export default router;