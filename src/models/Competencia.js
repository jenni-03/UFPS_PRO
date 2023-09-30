import { DataTypes } from 'sequelize';

// Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Competencia = sequelize.define('competencias', {
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
        }
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "La descripción de la competencia no puede ser vacia"
            }
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: false
});

// Exportamos el modelo
export default Competencia;
