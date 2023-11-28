import { Router } from 'express';
import { validateLoginData, validateReqPassReset } from '../schemas/userSchema.js';

// Importamos las funciones del controlador
import { login, logout, refresh, requestPasswordRst, resetPassword } from '../controllers/authController.js';

// Middlewares
import verifyJWT from '../middlewares/verifyJWT.js';
import extractToken from '../middlewares/extractToken.js';
import limiter from '../middlewares/rateLimit.js';

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la administración del Login de usuario
// @route POST /api/auth/login
// @access public
router.post('/login', [limiter, validateLoginData], login);


// @desc Enpoint encargado de realizar el refresco del token de acceso
// @route GET /api/auth/refresh
// @access public - token de refresco expirado
router.get('/refresh', refresh);


// @desc Enpoint encargado de gestionar el cierre de sesión
// @route POST /api/auth/logout
// @access only Users 
router.post('/logout', [extractToken, verifyJWT], logout);


// @desc Enpoint encargado de gestionar la petición de cambio de contraseña
// @route POST /api/auth/requestPasswordReset
// @access public 
router.post('/requestPasswordReset', [limiter, validateReqPassReset], requestPasswordRst);


// @desc Enpoint encargado de llevar a cabo el cambio de contraseña
// @route POST /api/auth/resetPassword
// @access public 
router.post('/resetPassword', resetPassword);

// Exportamos el router
export default router;