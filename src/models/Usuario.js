import { DataTypes } from 'sequelize';

// Importamos el objeto de conexión
import sequelize from '../database/db.js';


// Creamos el esquema del modelo
const User = sequelize.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len:{
                args: [3, 45],
                msg: "El nombre solo ha de contener entre 3 y 45 caracteres"
            }
        }
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
        allowNull: true,
        validate: {
            len: {
                args: [20, 60],
                msg: "La dirección ha de tener entre 20 y 60 caracteres"
            }
        }
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: {
            name: 'directors_document',
            msg: "Document already registered"
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
        allowNull: true,
        validate: {
            isNumeric: {
                msg: "El celular solo ha de contener números"
            }
        }
    },
    foto_perfil: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Student data
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            notEmpty:{
                msg: "El semestre no puede ser vacio"
            }
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    }
}, {
    timestamps: false
});



// Exportamos el modelo
export default User;
