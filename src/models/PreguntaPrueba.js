import { DataTypes } from 'sequelize';

// Impotamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const PreguntaPrueba = sequelize.define('pregunta_prueba', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'preguntas',
            key: 'id'
        }
    },
    prueba_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pruebas',
            key: 'id'
        }
    }
}, {
    timestamps: false
});


// Exportamos el modelo 
export default PreguntaPrueba;