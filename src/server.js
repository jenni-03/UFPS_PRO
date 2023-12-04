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
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cerrarConvocatoriasVencidas from './util/cerrarConvocatorias.js';
import schedule from 'node-schedule';


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
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ limit: '15mb' }));
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


// Tarea encargada de cerrar las convocatorias automaticamente
schedule.scheduleJob('0 0 18 * *', () => {
    cerrarConvocatoriasVencidas();
    logger.info('Tarea programada de cierre automático de convocatorias ejecutada.');
});


// Corremos el servidor
const main = async () => {

    try {

        // Sincroniza las tablas
        await sequelize.sync();
    
        // Crea los roles
        await generateRole();

        // Crea el usuario administrador
        await createAdminUser();
    
        // Inicia el servidor una vez que las tablas se sincronicen
        const server = app.listen(PORT, () => {
          logger.info({ status: 'Bienvenido, servidor actualmente en funcionamiento',  }, `App is running on http://localhost:${PORT}`);
        });

        // Configuramos los tiempos de espera del servidor
        server.timeout = 30000;
        server.keepAliveTimeout = 10000;
        server.headersTimeout = 20000;
        server.requestTimeout = 15000;

    } catch (err) {
        logger.error(err, `Error al intentar sincronizar con la BD`);
    }

}


// Llamada a la función principal
main();


