const express = require('express');
const {logger, logEvents} = require('./middlewares/logger');
const {errorHandler} = require('./middlewares/errorHandler');
const sequelize = require('./database/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./util/corsOptions');
const path = require('path');
const generateRole = require('./util/generateRole');
const createAdminUser = require('./util/createAdminUser');

// Importamos las tablas a crear
require('./database/associations');

// Importar Rutas de la API
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const preguntasRoutes = require('./routes/preguntas.routes');
const competenciaRoutes = require('./routes/competencia.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const pruebaRoutes = require('./routes/prueba.routes');
const convocatoriaRoutes = require('./routes/convocatoria.routes');

// Inicializar el contexto principal
const app = express();

// Puerto de escucha del servidor
const PORT = process.env.PORT || 3500;

// Especificamos el directorio de archivos estáticos
app.use(express.static(path.resolve(__dirname, './public')));

app.use('directors', express.static(path.resolve(__dirname, './public/directors')));

app.use('questions', express.static(path.resolve(__dirname, './public/questions')));

// Middlwares
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


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
sequelize.sync()
    .then(() => {

        // Creamos los roles y el usuario admin
        return Promise.all([generateRole(), createAdminUser()]);

    })
    .then(() => {

        // Iniciamos el servidor una vez que las tablas se sincronizen
        app.listen(PORT, () => {
            console.log('Server listening on port', PORT);
        });

    })
    .catch(err => console.error('Unable to connect to the database', err));




