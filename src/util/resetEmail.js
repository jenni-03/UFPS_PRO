import nodeMailer from 'nodemailer';
import mailGen from 'mailgen';
import crypto from 'crypto';
import PasswordReset from '../models/PasswordReset.js';
import bcrypt from 'bcrypt';
import configuration from '../config.js';
import logger from '../middlewares/logger.js';
import dayjs from 'dayjs';


// Obtenemos las credenciales del correo
const { email_address, email_password } = configuration;


/**
 * Función encargada de el envio de correo para el restablecimiento de contraseña de un usuario
 * @param {object} user 
 * @param {string} redirectURL 
 */
const sendResetEmail = async (user, redirectURL) => {

    try{

        const {id, email, nombre, apellido} = user;

        // Generamos la cadena de reseteo
        const resetString = crypto.randomBytes(64).toString('hex') + id;

        const hashedString = await hashResetString(id, resetString);

        // Creamos o actualizamos el registro de restablecimiento
        updateRecordReset(id, hashedString);

        // Crear un objeto de configuración con las credenciales
        let config = {
            service: 'gmail',
            auth: {
                user: email_address,
                pass: email_password
            },
            port: 465,
            secure: true
        };

        // Creamos el objeto transportador
        const transporter = nodeMailer.createTransport(config);

        // Creamos la estructura del email y generamos el HTML
        const emailBody = createEmailEstructure(id, nombre, apellido, redirectURL, resetString);

        // Configuramos el origen y destinatario
        const message = {
            from: email_address,
            to: email,
            subject: "Restablecimiento de contraseña",
            html: emailBody
        }

        // Enviamos el correo electronico
        await transporter.sendMail(message);
        logger.info('Email de restablecimiento enviado correctamente');
        

    }catch(error){
        throw new Error(`Error al enviar email de restablecimiento: ${error.message}`);
    }

}


/**
 * Función encargada de encriptar la cadena de restablecimiento de contraseña
 * @param {number} id 
 * @param {string} resetString 
 * @returns a hashed string
 */
const hashResetString = async (id, resetString) => {

    // Hasheamos la cadena de restablecimiento
    const saltRounds = await bcrypt.genSalt(11);
    const hashed = bcrypt.hash(resetString, saltRounds);

    return hashed; 
    
}


/**
 * Función encargada de crear o actualizar el registro de restablecimiento de contraseña según sea el caso
 * @param {number} id 
 * @param {string} hashedString 
 */
const updateRecordReset = async (id, hashedString) => {

    // Verificamos si el usuario ya posee un registro de restablecimiento
    const existingReset = await PasswordReset.findOne({
        where: {
            usuario_id: id
        }
    });

    if (existingReset){

        // Actualizamos el actual
        existingReset.uniqueString = hashedString;
        existingReset.created_At = dayjs().toDate();
        existingReset.expires_At = dayjs().add(1, 'hours').toDate();
        existingReset.expired = false;

        await existingReset.save();

    }else{

        // Creamos un nuevo registro de restablecimiento
        await PasswordReset.create({
            uniqueString: hashedString,
            created_At: dayjs().toDate(),
            expires_At: dayjs().add(1, 'hours').toDate(),
            expired: false,
            usuario_id: id
        });

    }

}


/**
 * Función encargada de crear el cuerpo del correo de restablecimiento de contraseña
 * @param {number} id 
 * @param {string} nombre 
 * @param {string} apellido 
 * @param {string} redirectURL 
 * @param {string} resetString 
 * @returns body reset password email
 */
const createEmailEstructure = (id, nombre, apellido, redirectURL, resetString) => {

    const mailGenerator = new mailGen({
        theme: "default",
        product: {
            name: "UFPS_PRO",
            link: "https://ww2.ufps.edu.co", 
            copyright: 'Copyright © 2023 UFPS. All rights reserved.',
            logo: 'https://divisist2.ufps.edu.co/public/documentos/63b79750fa95f00107f1322ae668405d.png'
        }
    });

    const response = {
        body: {
            greeting: 'Corial saludo',
            name: `${nombre} ${apellido}`,
            intro: 'Has recibido este correo debido a que recibimos una solicitud de cambio de contraseña de tu parte',
            action: {
                instructions: 'Haz click en el botón ubicado en la parte inferior.',
                button: {
                    color: '#eb343d',
                    text: 'Restablecer contraseña',
                    link: `${redirectURL}/${id}/${resetString}`
                }
            },
            outro: "Recuerda que este link expirará en 60 minutos, si no solicitaste un cambio de contraseña hacer caso omiso a este mensaje",
            signature: 'Atentamente, el equipo de desarrollo de ing. de sistemas'
        }
    }

    return mailGenerator.generate(response);

}

export default sendResetEmail;