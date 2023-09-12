const {DataTypes} = require('sequelize');

// Importamos el modelo de conexión
const sequelize = require('../database/db');


// Creamos el esquema del modelo
const Convocatoria = sequelize.define('convocatorias', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la competencia no puede ser vacio'
            },
            len:{
                args: [5, 55],
                msg: "El nombre de la competencia ha de contener minimo 5 caracteres"
            }
        }
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "La descripcion de la competencia no puede ser vacia"
            },
            len:{
                args: [20, 200],
                msg: "La descripción de la competencia ha de tener un minimo de 20 caracteres"
            }
        }
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        validate: {
            notEmpty: {
                msg: "La fecha de inicio de la convocatoria no puede ser vacia"
            },
            isDate: {
                msg: "Favor ingresar un formato de fecha valido"
            }
        }
    },
    fecha_fin: {
        type: DataTypes.DATE,
        validate: {
            notEmpty: {
                msg: "La fecha de finalizacion de la convocatoria no puede ser vacia"
            },
            isDate: {
                msg: "Favor ingresar un formato de fecha valido"
            }
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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


// Exportamos el modelo de inscripciones
module.exports = Convocatoria;