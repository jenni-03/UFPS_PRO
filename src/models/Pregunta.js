const {DataTypes} = require('sequelize');

// Importamos el modelo de conexión
const sequelize = require('../database/db');


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
            },
            isNumeric: {
                msg: "El semestre solo ha de contener números"
            },
            min: {
                args: 1,
                msg: "El semestre debe ser mayor que 0"
            },
            max: {
                args: 10,
                msg: "El semestre debe ser menor o igual a 10"
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
            },
            len: {
                args: [0, 255],
                msg: 'Pregunta fuera de rango'
            }
        }
    },
    imagen: {
        type: DataTypes.STRING,
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
module.exports = Pregunta;