
/** Middleware encargado de verificar que un usuario sea administrador */

const isAdmin = (req, res, next) => {

    // Obtenemos los datos del usuario a través del token
    const { type } = req.user;

    // Verificamos que el usuario sea administrator
    if(type === 'Director'){
        next();
        return;
    }

    req.log.warn(`Intento de acceso no autorizado por parte del usuario con identificador: ${req.user.id}`);
    return res.status(403).json({message: 'Accesso Restringido'});

};

export default isAdmin;