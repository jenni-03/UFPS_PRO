import { DataTypes } from 'sequelize';
import Resultado from './Resultado.js';
import Respuesta from './Respuesta.js';

// Importamos el modelo de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Inscripcion = sequelize.define('inscripciones', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_inscripcion: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                msg: "Favor ingresar un formato de fecha valido"
            }
        }
    },
    fecha_inicio_prueba: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: {
                msg: "Favor ingresar un formato de fecha valido"
            }
        }
    },
    fecha_finalizacion_prueba: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: {
                msg: "Favor ingresar un formato de fecha valido"
            }
        }
    },
    tiempo_restante_prueba: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    convocatoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'convocatorias',
            key: 'id'
        },
    }
}, {
    hooks: {
        beforeDestroy: async (inscripcion, options) => {
            try{
                await Promise.all([
                    Resultado.destroy({ where: { inscripcion_id: inscripcion.id } }),
                    Respuesta.destroy({ where: { inscripcion_id: inscripcion.id } })
                ]);
            }catch(err){
                const errorDelete = new Error(`Error al intentar eliminar datos de la inscripcion relacionados con el ID de usuario ${inscripcion.usuario_id}`);
                errorDelete.stack = err.stack; 
                throw errorDelete; 
            }
        }
    },
    paranoid: true,
    deletedAt: 'fecha_inactivacion',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});


// Exportamos el modelo de inscripciones
export default Inscripcion;