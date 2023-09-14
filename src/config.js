import { config } from 'dotenv';

config();

// Configuración de la base de datos
const configuration = {

    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    email_address: process.env.EMAIL_ADDRESS,
    email_password: process.env.EMAIL_PASSWORD,

}

export default configuration;

