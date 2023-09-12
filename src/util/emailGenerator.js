const nodeMailer = require('nodemailer');
const mailGen = require('mailgen');


/** Función encargada de llevar a cabo el envio de las credenciales a los usuarios que aun no se encuentran registrados
 *  en el sistema
*/
const generateEmail = async (userName, userEmail, userPassword) => {

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

    const response = {
        body: {
            greeting: 'Hola',
            name: userName,
            intro: "Te damos la bienvenida al simulador UFPS_PRO, a continuación te mostramos tus credenciales de acceso",
            table: {
                data: [{
                    email: userEmail,
                    password: userPassword
                }]
            },
            outro: "Puedes cambiar la contraseña una vez hayas iniciado sesión",
            signature: 'Atentamente, el equipo de desarrollo de'
        }
    }

    // Generamos un HTML del email con el cuerpo proporcionado
    const emailBody = mailGenerator.generate(response);

    // Configuramos el origen y destinatario
    const message = {
        from: process.env.EMAIL_ADDRESS,
        to: userEmail,
        subject: "Credenciales de acceso UFPS_PRO",
        html: emailBody
    }

    // Enviamos el correo electronico
    await transporter.sendMail(message);
    console.log('Mensaje enviado exitosamente');

};


module.exports = generateEmail;