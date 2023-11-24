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
            req.log.warn({ user: foundUser !== null ? [ foundUser.id, foundUser.nombre ] : 'usuario no registrado' }, 'Uso de token con acceso no autorizado');
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
            req.log.warn({ token_recibido: req.token }, 'Envio de token no valido');
            return res.status(401).json({ error: 'Token inválido' });
        }
        if(err.name === 'TokenExpiredError') {
            req.log.warn({ token_recibido: req.token }, 'Intento de uso de token expirado');
            return res.status(401).json({ error: 'Token expirado' });
        }
        
        const errorToken = new Error(`Error al verificar token - ${err.message}`);
        errorToken.stack = err.stack; 
        next(errorToken);

    }

};


export default verifyJWT;