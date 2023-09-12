const {DataTypes} = require('sequelize');

// Importamos el modelo de conexión
const sequelize = require('../database/db');


// Creamos el esquema del modelo
const Prueba = sequelize.define('pruebas', {
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
        },
        validate: {
            notEmpty: {
                msg: 'El nombre de la prueba no puede ser vacio'
            },
            len:{
                args: [10, 55],
                msg: "El nombre de la prueba solo ha de contener minimo 10 caracteres"
            }
        }
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "La descripcion de la prueba no puede ser vacia"
            },
            len:{
                args: [30, 200],
                msg: "La descripción de la prueba ha de tener un minimo de 30 caracteres"
            }
        }
    },
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    duracion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            notEmpty:{
                msg: "La duración de la prueba no puede ser vacia"
            },
            isNumeric: {
                msg: "La duración de la prueba es un valor numerico"
            },
            min: {
                args: 1,
                msg: "La duración de la prueba debe ser mayor que 0"
            },
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    total_preguntas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            notEmpty:{
                msg: "El total de preguntas de la prueba no puede ser nulo"
            },
            isNumeric: {
                msg: "El total de preguntas de la prueba es un valor numerico"
            },
            min: {
                args: 1,
                msg: "El total de preguntas debe ser mayor que 0"
            }
        }
    },
    puntaje_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            notEmpty:{
                msg: "El puntaje total de la prueba no puede ser vacio"
            },
            isNumeric: {
                msg: "El puntaje total de la prueba es un valor numerico"
            },
            min: {
                args: 1,
                msg: "El puntaje total debe ser mayor que 0"
            }
        },
        defaultValue: 500
    }
}, {
    timestamps: false
});


// Exportamos el modelo
module.exports = Prueba;