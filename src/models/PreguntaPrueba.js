const {DataTypes} = require('sequelize');

// Impotamos el objeto de conexión
const sequelize = require('../database/db');


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
module.exports = PreguntaPrueba;