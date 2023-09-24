import { DataTypes } from 'sequelize';

// Importamos el objeto de conexión
import sequelize from '../database/db.js';

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
    created_At: {
        type: DataTypes.DATE
    },
    expires_At: {
        type: DataTypes.DATE
    },
    expired: {
        type: DataTypes.BOOLEAN
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    updatedAt: 'lastUpdate',
    createdAt: false
});


// Exportamos el modelo
export default PasswordReset;