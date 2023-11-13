import { DataTypes } from 'sequelize';

// Importamos el objeto de conexión
import sequelize from '../database/db.js';

// Creamos el esquema del modelo
const PasswordReset = sequelize.define('Password_resets', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uniqueString: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_At: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expires_At: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expired: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Usuarios',
            key: 'id'
        },
        allowNull: false
    }
}, {
    timestamps: true,
    updatedAt: 'lastUpdate',
    createdAt: false,
    freezeTableName: true
});


// Exportamos el modelo
export default PasswordReset;