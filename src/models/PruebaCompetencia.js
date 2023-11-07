import { DataTypes } from 'sequelize';

//Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const PruebaCompetencia = sequelize.define('pruebas_competencias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    prueba_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pruebas',
            key: 'id'
        }
    },
    competencia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'competencias',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

// Exportamos el modelo
export default PruebaCompetencia;