const allowedOrigins = require('./allowedOrigins');

// Definimos la configuración CORS
const corsOptions = {

    // Permitimos el acceso solo a los origenes permitidos
    origin: (origin, callback) => {

        if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }else{
            callback(new Error('Not allowed by CORS'));
        }

    },
    // Habilita el intercambio de cookies al permitir que estas y los encabezados de autorización se incluyan en las solicitudes CORS
    credentials: true, 
    // Establece el código de estado de respuesta para las solicitudes de preflight CORS (solicitudes OPTIONS).
    optionsSuccessStatus: 200

};

module.exports = corsOptions;