import { Sequelize } from 'sequelize';
import configuration from '../config.js';
import logger from '../middlewares/logger.js';

const { database, username, password, host, port } = configuration;

// Creamos la instancia de conexión
const sequelize = new Sequelize(database, username, password, {
    host,
    dialect: 'mysql',
    port,
    pool: {
        max: 70,
        min: 0,
        acquire: 350, // Tiempo requerido para buscar una conexión libre
        idle: 10000 // Tiempo maximo en el que una conexión esta inactiva
    },
    logging: false
});


// Exportamos el objeto de conexión
export default sequelize;
