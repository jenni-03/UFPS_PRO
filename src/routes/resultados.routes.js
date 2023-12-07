import {Router} from 'express';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';


// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargado de la obtención de todas las pruebas realizadas por el estudiante
// @route GET /api/resultados
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateCategoryData], categoriaController.getCategorias);