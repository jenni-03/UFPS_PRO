import { DataTypes } from 'sequelize';

// Importamos el modelo de conexión
import sequelize from '../database/db.js';

// Creamos el esquema del modelo
const Resultado = sequelize.define('resultados', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    puntaje: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "El puntaje no puede ser vacio"
            },
            isNumeric: {
                msg: "El puntaje solo puede ser un valor numerico"
            }
        }
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias',
            key: 'id'
        }
    },
    inscripcion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'inscripciones',
            key: 'id'
        }
    }
}, {
    timestamps: false
});

//Exportsamos el modelo
export default Resultado;