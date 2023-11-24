import { DataTypes } from 'sequelize';

//Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Respuesta = sequelize.define('Respuestas', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    opcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    inscripcion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Inscripciones',
            key: 'id'
        }
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Preguntas',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

// Exportamos el modelo
export default Respuesta;