import Usuario from '../models/Usuario.js';
import Rol from '../models/Rol.js';


/** Middleware encargado de verificar que un usuario sea administrador */

const isAdmin = async (req, res, next) => {

    // Obtenemos el usuario y verificamos su existencia
    const username = req.user.username;

    const user = await Usuario.findOne({
        where: {
            email: username
        }
    });

    // Verificamos que el usuario sea administrator
    if(user.tipo === 'director' && user.estado){
        next();
        return;
    }

    return res.status(403).json({message: 'Accesso Restringido'});

};

export default isAdmin;