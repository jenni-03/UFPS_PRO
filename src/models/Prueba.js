import { DataTypes } from 'sequelize';

// Importamos el modelo de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Prueba = sequelize.define('Pruebas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: {
            name: "nombre_prueba",
            msg: "Nombre de prueba ya en uso"
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    duracion: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    total_preguntas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    puntaje_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 500
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});


// Exportamos el modelo
export default Prueba;