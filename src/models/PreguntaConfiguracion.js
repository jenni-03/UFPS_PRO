import { DataTypes } from 'sequelize';

//Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const PreguntaConfiguracion = sequelize.define('PreguntaConfig', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Preguntas',
            key: 'id'
        }
    },
    configuracion_categoria_id: {  
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Configuraciones_categorias',
            key: 'id'
        }
    },
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

// Exportamos el modelo
export default PreguntaConfiguracion;