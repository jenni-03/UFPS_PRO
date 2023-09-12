const {DataTypes} = require('sequelize');

//Importamos el objeto de conexión
const sequelize = require('../database/db');


// Creamos el esquema del modelo
const ConfiguracionCategoria = sequelize.define('configuracion_categoria', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cantidad_preguntas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "La cantidad de preguntas solo puede contener números"
            },
            min: {
                args: 1,
                msg: "La cantidad de preguntas por categoria debe ser mayor que 0"
            }
        }
    },
    valor_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "El valor de la categoría solo puede contener números"
            },
            min: {
                args: 1,
                msg: "El valor de la categoria debe ser mayor que 0"
            },
            max: {
                args: 100,
                msg: "El valor de la categoria debe ser menor o igual a 100"
            }
        }
    },
    prueba_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pruebas',
            key: 'id'
        }
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

module.exports = ConfiguracionCategoria;