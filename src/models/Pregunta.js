import { DataTypes } from 'sequelize';

// Importamos el modelo de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Pregunta = sequelize.define('preguntas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    texto_pregunta: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "El texto de la pregunta no puede ser vacio"
            }
        }
    },
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "El semestre no puede ser vacio"
            }
        }
    },
    opciones: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Las opciones no pueden ser vacias"
            }
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    respuesta: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Las opciones no pueden ser vacias"
            }
        }
    },
    imagen: {
        type: DataTypes.JSON,
        allowNull: true
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias',
            key: 'id'
        }
    }
}, {
    timestamps: false
});


// Exporamos el modelo
export default Pregunta;