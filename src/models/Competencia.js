import { DataTypes } from 'sequelize';

// Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Competencia = sequelize.define('Competencias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "El nombre de la competencia no puede ser vacio"
            }
        },
        unique: {
            name: "nombre_competencia",
            msg: "Nombre de competencia ya en uso"
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

// Exportamos el modelo
export default Competencia;
