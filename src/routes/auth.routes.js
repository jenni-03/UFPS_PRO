const {Router} = require('express');

// Importamos las funciones del controlador
const authController = require('../controllers/authController');

// Middlewares
const verifyJWT = require('../middlewares/verifyJWT');

// Inicializamos el router
const router = Router();


// Routes

// @desc Endpoint encargado de la administración del Login de usuario
// @route POST /api/auth/login
// @access public
router.post('/login', authController.login);


// @desc Enpoint encargado de realizar el refresco del token de acceso
// @route GET /api/auth/refresh
// @access public - token de refresco expirado
router.get('/refresh', authController.refresh);


// @desc Enpoint encargado de gestionar el cierre de sesión
// @route POST /api/auth/logout
// @access public 
router.post('/logout', verifyJWT, authController.logout);


// @desc Enpoint encargado de gestionar la petición de cambio de contraseña
// @route POST /api/auth/requestPasswordReset
// @access public 
router.post('/requestPasswordReset', authController.requestPasswordRst);


// @desc Enpoint encargado de llevar a cabo el cambio de contraseña
// @route POST /api/auth/resetPassword
// @access public 
router.post('/resetPassword', authController.resetPassword);

// Exportamos el router
module.exports = router;