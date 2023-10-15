import express from 'express';
import logger from './middlewares/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import sequelize from './database/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './util/corsOptions.js';
import generateRole from './util/generateRole.js';
import createAdminUser from './util/createAdminUser.js';
import pino_http from 'pino-http';
import pino from 'pino';

// Importamos las tablas a crear
import './database/associations.js';

// Importar Rutas de la API
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import preguntasRoutes from './routes/preguntas.routes.js';
import competenciaRoutes from './routes/competencia.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import pruebaRoutes from './routes/prueba.routes.js';
import convocatoriaRoutes from './routes/convocatoria.routes.js';

// Inicializar el contexto principal
const app = express();

// Puerto de escucha del servidor
const PORT = process.env.PORT || 3500;


// Middlwares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(pino_http({

    logger,

    // Serializers
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    },

    wrapSerializers: true,

    // Custom logger level
    customLogLevel: function (req, res, err) {
        if (res.statusCode === 404) return 'warn'
        else if (res.statusCode >= 300) return 'silent'; 
        return 'info';
    },

    // Mensaje de exito
    customSuccessMessage: function (req, res) {
        if (res.statusCode === 404) {
          return 'Recurso no encontrado';
        }
        return `${req.method} operacion completada`;
    },

    // Mensaje de recibido
    customReceivedMessage: function (req, res) {
        return 'Solicitud recibida: ' + req.method
    },

    // Sobrescritura de las llaves del objeto log
    customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'timeTaken'
    }

}));


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/question', preguntasRoutes);
app.use('/api/competencia', competenciaRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/prueba', pruebaRoutes);
app.use('/api/convocatoria', convocatoriaRoutes);


// En caso de acceder a una ruta no especificada
app.all('*', (req, res) => {

    res.status(404);

    if(req.accepts('json')){
        res.json({message: "404 Not Found"});
    }else{
        res.type('txt').send('404 Not Found');
    }

});


// Middleware de manejo de errores
app.use(errorHandler);


// Corremos el servidor
const main = async () => {

    try {

        // Sincroniza las tablas
        await sequelize.sync();
    
        // Crea los roles y el usuario admin
        generateRole();
        createAdminUser();
    
        // Inicia el servidor una vez que las tablas se sincronicen
        app.listen(PORT, () => {
          logger.info(`App is running on http://localhost:${PORT}`);
        });

      } catch (err) {
        logger.error(`Error al sincronizar con la BD: ${err.message}`);
      }

}


// Llamada a la función principal
main();


