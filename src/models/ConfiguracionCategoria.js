import { DataTypes } from 'sequelize';
import PreguntaConfiguracion from './PreguntaConfiguracion.js';

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
    hooks: {

        beforeDestroy: async (configuracionCategoria, options) => {
            try{
                await PreguntaConfiguracion.destroy({ where: { configuracion_categoria_id: configuracionCategoria.id } })
            }catch(err){
                const errorDelete = new Error(`Error al intentar eliminar las preguntas de la prueba con ID ${configuracionCategoria.prueba_id} de la categoria ${configuracionCategoria.categoria_id}`);
                errorDelete.stack = err.stack; 
                throw errorDelete; 
            }
        }

    },
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

export default ConfiguracionCategoria;