import { Sequelize } from 'sequelize';
import configuration from '../config.js';


const { database, username, password, host, port } = configuration;

// Creamos la instancia de conexión
const sequelize = new Sequelize(database, username, password, {
    host,
    dialect: 'mysql',
    port,
    pool: {
        max: 70,
        min: 0,
        acquire: 3000, // Tiempo requerido para buscar una conexión libre
        idle: 1000 // Tiempo maximo en el que una conexión esta inactiva
    }
});


// Exportamos el objeto de conexión
export default sequelize;
