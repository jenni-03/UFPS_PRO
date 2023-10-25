import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/Usuario.js';
import sendResetEmail from '../util/resetEmail.js';
import PasswordReset from '../models/PasswordReset.js';
import dayjs from 'dayjs';


/* --------- Login function -------------- */

export const login = async (req, res, next) => {

    try{

        // Obtenemos las credenciales del usuario
        const {email, password} = req.body;

        // Verificamos la existencia del usuario
        const userFound = await Usuario.findOne({
            where: {
                email
            }
        });

        if(!userFound || !userFound.estado){
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Comprobamos la contraseña
        const match = await bcrypt.compare(password, userFound.password);

        if(!match){
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Creamos el token de acceso
        const accessToken = jwt.sign({
            id: userFound.id,
            username: email,
            tipo: userFound.tipo
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // Creamos el token de refresco
        const refreshToken = jwt.sign(
            {
                id: userFound.id,
                username: email,
                tipo: userFound.tipo
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '5d' }
        );

        // Creamos una cookie para almacenar el token de refresco
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 5 * 24 * 60 * 1000
        });

        // Enviamos el token de acceso al usuario
        res.json({
            username: email,
            name: userFound.nombre,
            role: userFound.tipo,
            accessToken
        });

    }catch(error){
        next(new Error(`Ocurrio un problema al intentar iniciar sesion: ${error.message}`));
    }

};


/* --------- Refresh function -------------- */

export const refresh = (req, res) => {

    // Recuperamos la cookie
    const cookies = req.cookies;

    if(!cookies?.jwt){
        req.log.warn('No se encontro token de refresco adjunto');
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    // Obtenemos el token de refresco
    const refreshToken = cookies.jwt;

    // Verificamos el token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, user) => {

            if(err){ 
                req.log.warn("Token de refresco no proporcionado o token no valido");
                return res.status(403).json({ error: 'Acceso prohibido' }) 
            };

            // Verificamos los datos del payload
            const foundUser = await Usuario.findByPk(user.id);

            if(!foundUser) {
                req.log.warn("Token no valido");
                return res.status(401).json({ error: 'Acceso no autorizado' });
            }

            // Volvemos a crear el token de acceso
            const accessToken = jwt.sign(
                {
                    id: foundUser.id,
                    username: foundUser.email,
                    tipo: foundUser.tipo
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            res.status(200).json({ accessToken });

        }
    );

};


/* --------- Logout function -------------- */

export const logout = (req, res) => {

    // Obtengo las cookies
    const cookies = req.cookies;

    // Verfico que la cookie que almacena el token de refresco existe
    if(!cookies?.jwt){
        req.log.warn('Token de refresco no proporcionado');
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    // Elimino la cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', secure: false });

    res.status(200).json({ message: 'Sesión terminada correctamente!' });

};


/* --------- request_password_reset function -------------- */

export const requestPasswordRst = async (req, res, next) => {

    try{

        // Obtenemos el email y la URL de redireccion
        const {email, redirectURL} = req.body;

        // Verificamos que el email proporcionado existe
        const user = await User.findOne({
            where: {
                email
            }
        });

        if(!user || !user.estado){
            req.log.warn('Intento de restablecimiento no autorizado');
            return res.status(400).json({ error: 'El email proporcionado no esta autorizado para solicitar un cambio de contraseña' });
        }

        // Enviamos el email de reset
        await sendResetEmail(user, redirectURL);

        res.status(200).json({message: 'Correo de restablecimiento de contraseña enviado correctamente'});

    }catch(err){
        next(new Error(`Ocurrio un problema al verificar el email ${err}`));
    }

};


/* --------- password_reset function -------------- */

export const resetPassword = async (req, res, next) => {

    try{

        // Obtenemos los datos requeridos para el restablecimiento
        const {user_id, resetString, newPassword} = req.body;

        // Buscamos el registro de la petición realizada por el usuario
        const password_reset = await PasswordReset.findOne({
            where: {
                usuario_id: user_id
            }
        });

        if(!password_reset){
            req.log.warn(`El usuario con id: ${user_id} no tiene peticiones de cambio de contraseña`);
            return res.status(400).json({ error: `No existe una petición de cambio de contraseña por parte del usuario` });
        }

        // Verificamos que el registro de la petición de cambio sea aun valido
        const { expires_At } = password_reset;

        if(expires_At < dayjs().toDate() || password_reset.expired){
            
            req.log.warn(`El usuario con id: ${user_id} ha intentado un restablecimiento con un link expirado`);
            return res.status(400).json({ error: `El link de restablecimiento ha expirado` });

        }

        // Verificamos la cadena de restablecimiento
        const match = await bcrypt.compare(resetString, password_reset.uniqueString);

        if(!match){
            req.log.warn(`El usuario con id: ${user_id} ha proporcionado un link restablecimiento no valido`);
            return res.status(400).json({ error: 'La cadena de restablecimiento no coincide' });
        }

        // Volvemos a encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(12);
        const hashedNewPswd = await bcrypt.hash(newPassword, salt);

        // Actualizamos la contraseña del usuario
        await Usuario.update({
            password: hashedNewPswd
        }, {
            where: {
                id: user_id
            }
        });

        // Inhabilitamos el registro de restablecimiento
        password_reset.expired = true;
        await password_reset.save();

        // Respondemos al usuario
        res.status(200).json({ message: 'Contraseña restablecida correctamente' });

    }catch(err){
        next(new Error(`Ocurrio un problema al restablecer la contrasenia del usuario ${err.message}`));
    }

}
