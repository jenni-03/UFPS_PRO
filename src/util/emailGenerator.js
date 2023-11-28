import mailGen from 'mailgen';
import logger from '../middlewares/logger.js';
import mail_rover from './mailRover.js';
import configuration from '../config.js';


/**
 * Función encargada de llevar a cabo el correspondiente correo de notificación a los usuarios sobre su inclusión
 * en la convocatoria e indicarles el proceso de ingreso al sistema si es necesario 
 * @param {string[]} userEmails 
 * @param {string} convocatoria_name 
 * @param {string} convocatoria_descripcion
 * @param {Date} fecha_inicio
 * @param {Date} fecha_fin
 */
const generateEmail = async (userEmails, convocatoria_name, convocatoria_descripcion, fecha_inicio, fecha_fin) => {

    return new Promise((resolve, reject) => {

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
                greeting: 'Cordial saludo estimad@ estudiante',
                intro: `Te damos la bienvenida al simulador UFPS_PRO, la universidad te ha seleccionado para participar en el siguiente simulacro 
                llevado a cabo en nuestro sistema:`,
                table: {
                    data: [{
                        fecha_inicio,
                        convocatoria: convocatoria_name,
                        descripcion: convocatoria_descripcion,
                        fecha_fin
                    }]
                },
                outro: "En caso de ser tu primer ingreso en el sistema, es indispensable que solicites un cambio de contraseña con tu correo para ingresar correctamente",
                signature: 'Atentamente, el equipo de desarrollo de ing. de sistemas'
            }

        }

        // Generamos un HTML del email con el cuerpo proporcionado
        const emailBody = mailGenerator.generate(response);

        // Definimos el objeto que envia el correo
        mail_rover()
            .then(async transporter => {

                // Configuramos el origen y destinatario
                const message = {
                    from: configuration.email_address,
                    to: userEmails,
                    subject: 'Notificación de inscripción',
                    html: emailBody
                }

                await transporter.sendMail(message, (error, info) => {

                    if (error) reject(error);
                    else {
                        logger.info(`Email de notificacion enviado a los correos ${userEmails}`);
                        resolve();
                    }

                });

            })
            .catch(err => {
                reject(new Error(`Error al enviar el email de notificacion de inscripcion - ${err.message}`));
            });

    });


};


export default generateEmail;