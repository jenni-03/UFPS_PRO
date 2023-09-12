const nodeMailer = require('nodemailer');
const mailGen = require('mailgen');
const crypto = require('crypto');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcrypt');
const {email_address, email_password} = require('../config')


/** Función encargada de el envio de correo para el restablecimiento de contraseña de un 
 *  usuario
 */
const sendResetEmail = async (user, redirectURL) => {

    try{

        const {id, email, nombre, apellido} = user;

        // Generamos la cadena de reseteo
        const resetString = crypto.randomBytes(64).toString('hex') + id;

        // Eliminamos todos los registros de PasswordReset correspondientes a ese id
        await PasswordReset.destroy({
            where:{
                usuario_id: id
            }
        });

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

        // Creamos la estructura del email
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
                greeting: 'Hola',
                name: `${nombre} ${apellido}`,
                action: {
                    instructions: 'Estamos al tanto de tu solicitud de restablecimiento de contraseña, para continuar con ella, haz click en el botón ubicado en la parte inferior:',
                    button: {
                        color: '#eb343d',
                        text: 'Restablecer contraseña',
                        link: `${redirectURL}/${id}/${resetString}`
                    }
                },
                outro: "Recuerda que este link expirará en 60 minutos",
                signature: 'Atentamente, el equipo de desarrollo de'
            }
        }

        // Hasheamos la cadena de restablecimiento
        const saltRounds = await bcrypt.genSalt(11);
        const hashedString = await bcrypt.hash(resetString, saltRounds);

        // Creamos un nuevo PasswordReset
        const newPasswordReset = await PasswordReset.create({
            uniqueString: hashedString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
            usuario_id: id
        })

        // Generamos un HTML del email con el cuerpo proporcionado
        const emailBody = mailGenerator.generate(response);

        // Configuramos el origen y destinatario
        const message = {
            from: email_address,
            to: email,
            subject: "Restablecimiento de contraseña",
            html: emailBody
        }

        // Enviamos el correo electronico
        await transporter.sendMail(message);
        console.log('Mensaje enviado exitosamente');

    }catch(error){
        throw new Error(`Error al enviar email de restablecimiento: ${error.message}`);
    }

}

module.exports = sendResetEmail;