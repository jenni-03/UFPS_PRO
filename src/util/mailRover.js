import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import configuration from '../config.js';
const OAuth2 = google.auth.OAuth2;

// Obtenemos las credenciales del correo
const { email_address, oauth_client_id, oauth_client_secret, oauth_refresh_token, email_password } = configuration;


// Creamos un objeto de configuracion con las credenciales
const accountTransport = {
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: email_address,
        pass: email_password,
        clientId: oauth_client_id,
        clientSecret: oauth_client_secret,
        refreshToken: oauth_refresh_token
    },
    port: 465,
    secure: true
};


/**
 * Función encargada de establecer la conexión con oauth para el envio de correos
 * @param {Function} callback correspondiente al proceso de creción del correo
 */
const mail_rover = () => {

    return new Promise((resolve, reject) => {

        const oauth2Client = new OAuth2(
            accountTransport.auth.clientId,
            accountTransport.auth.clientSecret,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: accountTransport.auth.refreshToken,
            tls: {
                rejectUnauthorized: false
            }
        });

        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject(new Error(`error al obtener token de acceso - ${err.message}`));
            } else {
                accountTransport.auth.accessToken = token;
                resolve(nodemailer.createTransport(accountTransport));
            }
        });

    });

};


export default mail_rover;