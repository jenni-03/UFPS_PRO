import { DataTypes } from 'sequelize';

//Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const PreguntaConfiguracion = sequelize.define('preguntasConfig', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'preguntas',
            key: 'id'
        }
    },
    configuracion_categoria_id: {  
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'configuraciones_categorias',
            key: 'id'
        }
    },
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

// Exportamos el modelo
export default PreguntaConfiguracion;