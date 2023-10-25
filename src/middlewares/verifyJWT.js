import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';


/** Middleware encargado de la verficicación del token de acceso de un usuario  */

const verifyJWT = async (req, res, next) => {

    try{

        // Verificamos el token
        const { id } = jwt.verify(
            req.token,
            process.env.ACCESS_TOKEN_SECRET
        )

        // Verificamos los datos del payload
        const foundUser = await Usuario.findByPk(id);

        if(!foundUser || !foundUser.estado) {
            req.log.warn(`Intento de acceso no autorizado por parte de presunto usuario con identificador ${id}`);
            return res.status(401).json({ message: 'Acceso no autorizado' });
        }

        req.user = {
            id,
            type: foundUser.tipo
        };
        next();

    }catch(err){

        
        // Manejamos los posibles errores
        if(err.name === 'JsonWebTokenError') {
            req.log.warn('Envio de token no valido');
            return res.status(401).json({ error: 'Token inválido' });
        }
        if(err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        
        next(new Error(`Error de verificación de token: ${err.message}`));

    }

};


export default verifyJWT;