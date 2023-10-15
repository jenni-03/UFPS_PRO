import nodeMailer from 'nodemailer';
import mailGen from 'mailgen';
import logger from '../middlewares/logger.js';


/**
 * Función encargada de llevar a cabo el correspondiente correo a los usuarios ya sea de notificación o
 * envio de las credenciales a los usuarios que aun no se encuentran registrados en el sistema
 * @param {string} userName 
 * @param {string} userEmail 
 * @param {string} userPassword 
 * @param {string} typeEmail 
 * @param {string} convocatoria_name 
 */
const generateEmail = async (userName, userEmail, userPassword, typeEmail, convocatoria_name) => {

    // Crear un objeto de configuración con las credenciales
    let config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        },
        secure: true,
        port: 465
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

    const response = typeEmail === 'Notificar' ? notification_response(userName, convocatoria_name).body : register_response(userName, userEmail, userPassword, convocatoria_name).body;

    // Generamos un HTML del email con el cuerpo proporcionado
    const emailBody = mailGenerator.generate(response);

    // Configuramos el origen y destinatario
    const message = {
        from: process.env.EMAIL_ADDRESS,
        to: userEmail,
        subject: typeEmail === 'Notificar' ? 'Notificación de inscripción' : "Credenciales de acceso UFPS_PRO",
        html: emailBody
    }

    // Enviamos el correo electronico
    await transporter.sendMail(message);
    logger.info('Mensaje de registro enviado exitosamente');

};


// Body de email de notificacion
const notification_response = (userName, convocatoria_name) => {

    return {

        body: {
            greeting: 'Cordial saludo',
            name: userName,
            intro: `Te queremos comunicar que has sido seleccionado para participal de la convocatoria ${convocatoria_name} próxima a iniciarse`,
            outro: "Favor ingresar a su apartado de usuario para más información",
            signature: 'Atentamente, el equipo de desarrollo de ing. de sistemas'
        }

    }

};

// Body de email de registro
const register_response = (userName, userEmail, userPassword, convocatoria_name) => {

    return {

        body: {
            greeting: 'Cordial saludo',
            name: userName,
            intro: `Te damos la bienvenida al simulador UFPS_PRO, has sido seleccionado para participar en la convocatoria
            ${convocatoria_name} próxima a realizarse, a continuación te mostramos tus credenciales de acceso`,
            table: {
                data: [{
                    email: userEmail,
                    password: userPassword
                }]
            },
            outro: "Una vez hayas iniciado sesión, es indispensable que cambies la contraseña ingresada a una de preferencia propia",
            signature: 'Atentamente, el equipo de desarrollo de ing. de sistemas'
        }

    }

};


export default generateEmail;