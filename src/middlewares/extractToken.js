/** Middleware encargado de la obtención del token para su verificación */

const extractToken = (req, res, next) => {

    // Verificamos el encabezado de autenticación
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Verificar el contenido
    if (!authHeader.startsWith('Bearer')){
        return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    // Obtenemos el token
    const token = authHeader.split(' ')[1];

    // Pasamos el token al sgt middleware   
    req.token = token;

    next();

};

export default extractToken;