const {DataTypes} = require('sequelize');

// Importamos el objeto de conexión
const sequelize = require('../database/db');

// Creamos el esquema del modelo
const PasswordReset = sequelize.define('password_resets', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uniqueString: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE
    },
    expiresAt: {
        type: DataTypes.DATE
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
});

// Exportamos el modelo
module.exports = PasswordReset;