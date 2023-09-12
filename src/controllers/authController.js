const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/Usuario');
const sendResetEmail = require('../util/resetEmail');
const PasswordReset = require('../models/PasswordReset');


/* --------- Login function -------------- */

const login = async (req, res) => {

    try{

        // Obtenemos las credenciales del usuario
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: 'Todos los campos son requeridos'});
        }

        // Verificamos la existencia del usuario
        const userFound = await Usuario.findOne({
            where: {
                email
            }
        });

        if(!userFound || !userFound.estado){
            return res.status(401).json({message: 'Credenciales incorrectas'});
        }

        // Comprobamos la contraseña
        const match = await bcrypt.compare(password, userFound.password);

        if(!match){
            return res.status(401).json({message: 'Credenciales incorrectas'});
        }

        // Creamos el token de acceso
        const accessToken = jwt.sign({
            username: email,
            tipo: userFound.tipo
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});

        // Creamos el token de refresco
        const refreshToken = jwt.sign(
            {
                username: email,
                tipo: userFound.tipo
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        // Creamos una cookie para almacenar el token de refresco
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 24 * 60 * 1000
        });

        // Obtnemos el rol del usuario
        const userRole = await Rol.findByPk(userFound.rol_id);

        // Enviamos el token de acceso al usuario
        res.json({
            username: email,
            name: userFound.nombre,
            role: userRole.nombre,
            accessToken
        });

    }catch(error){
        return res.status(500).json({message: `Error al intentar iniciar sesión: ${error.message}`});
    }

};


/* --------- Refresh function -------------- */

const refresh = async (req, res) => {

    // Recuperamos la cookie
    const cookies = req.cookies;

    if(!cookies?.jwt){
        return res.status(401).json({message: 'Acceso no autorizado'});
    }

    // Obtenemos el token de refresco
    const refreshToken = cookies.jwt;

    // Verificamos el token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {

            if(err) return res.status(403).json({message: 'Acceso prohibido'});

            // Verificamos los datos del payload
            const foundUser = Usuario.findOne({
                where: {
                    email: user.username
                }
            });

            if(!foundUser) return res.status(401).json({ message: 'Acceso no autorizado' });

            // Volvemos a crar el token de acceso
            const accessToken = jwt.sign(
                {
                    username: foundUser.email,
                    tipo: foundUser.tipo
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '25m'}
            );

            res.status(200).json({accessToken});

        }
    );

};


/* --------- Logout function -------------- */

const logout = (req, res) => {

    // Obtengo las cookies
    const cookies = req.cookies;

    // Verfico que la cookie que almacena el token de refresco existe
    if(!cookies?.jwt){
        return res.status(401).json({message: 'Acceso no autorizado'});
    }

    // Elimino la cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', secure: false });

    res.status(200).json({message: 'Sesión terminada correctamente!'});

};


/* --------- request_password_reset function -------------- */

const requestPasswordRst = async (req, res) => {

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
            return res.status(400).json({error: 'El email proporcionado no esta autorizado para solicitar un cambio de contraseña'});
        }

        // Enviamos el email de reset
        await sendResetEmail(user, redirectURL);

        res.status(200).json({message: 'Correo de restablecimiento de contraseña enviado correctamente'});

    }catch(err){
        return res.status(500).json({error: `Ocurrio un error al verificar el email ${err.message}`});
    }

};


/* --------- password_reset function -------------- */

const resetPassword = async (req, res) => {

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
            return res.status(400).json({error: `No existe una petición de cambio de contraseña por parte del usuario`});
        }

        // Verificamos que el registro de la petición de cambio sea aun valido
        const {expiresAt} = password_reset;

        if(expiresAt < Date.now()){
            
            // Eliminamos el registro
            await password_reset.destroy();

            return res.status(400).json({error: `El link de restablecimiento ha expirado`});

        }

        // Verificamos la cadena de restablecimiento
        const match = await bcrypt.compare(resetString, password_reset.uniqueString);

        if(!match){
            return res.status(400).json({error: 'La cadena de restablecimiento no coincide'});
        }

        // Volvemos a encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(11);
        const hashedNewPswd = await bcrypt.hash(newPassword, salt);

        // Actualizamos la contraseña del usuario
        await Usuario.update({
            password: hashedNewPswd
        }, {
            where: {
                id: user_id
            }
        });
        
        // Una vez actualizada la contraseña del usuario, eliminamos el registro
        await password_reset.destroy();

        // Respondemos al usuario
        res.status(200).json({message: 'Contraseña restablecida correctamente'});

    }catch(err){
        return res.status(500).json({error: `Error al intentar restablecer la contraseña del usuario: ${err.message}`});
    }

}

module.exports = {
    login,
    refresh,
    logout,
    requestPasswordRst,
    resetPassword
}