import { DataTypes } from 'sequelize';

//Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const ConfiguracionCategoria = sequelize.define('Configuraciones_categorias', {
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
                msg: "La cantidad de preguntas solo puede ser numerica"
            }
        }
    },
    valor_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "El valor porcentual de la categoría solo puede numerico"
            }
        }
    },
    prueba_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Pruebas',
            key: 'id'
        }
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Categorias',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

export default ConfiguracionCategoria;