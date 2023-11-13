import { DataTypes } from 'sequelize';

// Importamos el modelo de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const Convocatoria = sequelize.define('Convocatorias', {
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
            }
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                msg: "Favor ingresar un formato de fecha valido"
            }
        }
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
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
            model: 'Pruebas',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});


// Exportamos el modelo de inscripciones
export default Convocatoria;