import { DataTypes } from 'sequelize';
import ConfiguracionCategoria from './ConfiguracionCategoria.js';

// Importamos el modelo de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Prueba = sequelize.define('Pruebas', {
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
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    duracion: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    total_preguntas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    puntaje_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 500
    }
}, {
    hooks: {

        beforeDestroy: async (prueba, options) => {
            try{
                await Promise.all([
                    ConfiguracionCategoria.destroy({ where: { prueba_id: prueba.id } }),
                ]);
            }catch(err){
                const errorDelete = new Error(`Error al intentar eliminar datos relacionados con la prueba con ID ${prueba.id}`);
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


// Exportamos el modelo
export default Prueba;