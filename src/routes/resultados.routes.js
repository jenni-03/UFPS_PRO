import {Router} from 'express';


// Importamos las funciones del controlador
import resultController from '../controllers/resultadoController.js';

// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';


// Inicializamos el router
const router = Router();


// Rutas

// @desc Endpoint encargado de la obtención de los resultados obtenidos en una convocatoria especifica
// @route GET /api/resultados/estudiante/:id
// @access solo Estudiantes
router.get('/estudiante/:id', [extractToken, authJWT], resultController.getResultadoEstudiante);


// @desc Endpoint encargado de la obtención de los resultados obtenidos por un estudiante en una convocatoria especifica
// @route GET /api/resultados/estudiante/:userId/convocatoria/:convocatoriaId
// @access solo Admin
router.get('/estudiante/:userId/convocatoria/:convocatoriaId', [extractToken, authJWT, isAdmin], resultController.getResultadoEstudianteAdmin);


// @desc Endpoint encargado de la obtención de metricas basicas para los resultados globales de una convocatoria
// @route GET /api/resultados/convocatoria/:id
// @access solo Admin
router.get('/convocatoria/:id', [extractToken, authJWT, isAdmin], resultController.getMetricasResultadosConvocatoria);


// @desc Endpoint encargado de la obtención de los resultados globales obtenidos por el estudiante en todas sus convocatorias
// @route GET /api/resultados/estudiante/:id/global
// @access solo Admin
router.post('/estudiante/:id/global', [extractToken, authJWT, isAdmin], resultController.getResultadosGlobalEstudiante);


// @desc Endpoint encargado de la obtención de los resultados globales obtenidos por el estudiante en todas sus convocatorias segmentado por categorias
// @route GET /api/resultados/estudiante/:id/global/categorias
// @access solo Admin
router.post('/estudiante/:id/global/categorias', [extractToken, authJWT, isAdmin], resultController.getResultadosGlobalEstudianteCategorias);

// Exportamos el router
export default router;