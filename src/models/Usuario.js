import { DataTypes } from 'sequelize';
import encrypt from '../util/encryptPassword.js';
import PasswordReset from './PasswordReset.js';
import Inscripcion from './Inscripcion.js';

// Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const User = sequelize.define('Usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len:{
                args: [3, 55],
                msg: "El apellido solo ha de contener entre 3 y 55 caracteres"
            }
        }
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'users_code',
            msg: "El código propocionado ya existe"
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'users_email',
            msg: "El email proporcionado ya ha sido registrado"
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('Director', 'Estudiante'),
        allowNull: false
    },
    // Director data
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isNumeric: {
                msg: "El telefono solo ha de contener números"
            },
            len: {
                args: 7,
                msg: "El telefono solo puede contener 7 digitos"
            }
        }
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: {
            name: 'directors_document',
            msg: "El documento proporcionado ya se encuentra registrado"
        },
        validate: {
            isNumeric: {
                msg: "El documento solo ha de contener números"
            },
            len: {
                args: 10,
                msg: "El documento solo puede contener 10 digitos"
            }
        }
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: true
    },
    foto_perfil: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Student data
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles',
            key: 'id'
        }
    }
}, {
    hooks: {
        beforeCreate: async (user, options) => {
            try{
                const hashedPassword = await encrypt(user.password);
                user.password = hashedPassword;
            }catch(err){
                const errorPassword = new Error(`Error al intentar encriptar la contraseña del usuario con ID ${user.id}`);
                errorPassword.stack = err.stack; 
                throw errorPassword; 
            }
        },
        beforeDestroy: async (user, options) => {
            try{
                await Promise.all([
                    PasswordReset.destroy({ where: { usuario_id: user.id } }),
                    Inscripcion.destroy({ where: { usuario_id: user.id } })
                ]);
            }catch(err){
                const errorDelete = new Error(`Error al intentar eliminar datos relacionados al usuario con ID ${user.id}`);
                errorDelete.stack = err.stack; 
                throw errorDelete; 
            }
        }
    },
    paranoid: true,
    deletedAt: 'fecha_inactivacion',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});


// Exportamos el modelo
export default User;
