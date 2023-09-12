const {DataTypes} = require('sequelize');

// Importamos el objeto de conexión
const sequelize = require('../database/db');


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
            notEmpty:{
                msg: "El nombre no puede ser vacio"
            },
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
            notEmpty:{
                msg: "El apellido no puede ser vacio"
            },
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
        },
        validate:{
            notEmpty:{
                msg: "El código no puede ser vacio"
            },
            isNumeric: {
                msg: "El código solo ha de contener números"
            },
            len: {
                args: 7,
                msg: "El código solo puede contener 7 digitos"
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'users_email',
            msg: "El email proporcionado ya ha sido registrado"
        },
        validate:{
            notEmpty:{
                msg: "El email no puede ser vacio"
            },
            isEmail: {
                args: true,
                msg: "El correo debe corresponder con una dirección válida"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "La contraseña no puede ser vacia"
            },
            len: {
                args: [10, 65],
                msg: "La contraseña debe de tener 10 caracteres minimo"
            }
        }
    },
    tipo: {
        type: DataTypes.ENUM('director', 'estudiante'),
        allowNull: false
    },
    // Director data
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty:{
                msg: "El Telefono no puede ser vacio"
            },
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
            notEmpty:{
                msg: "La direccion no puede ser vacia"
            },
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
            notEmpty:{
                msg: "El documento no puede ser vacio"
            },
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
            notEmpty:{
                msg: "El celular no puede ser vacio"
            },
            isNumeric: {
                msg: "El celular solo ha de contener números"
            }
        }
    },
    foto_perfil: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Student data
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            notEmpty:{
                msg: "El semestre no puede ser vacio"
            },
            isNumeric: {
                msg: "El semestre solo ha de contener números"
            },
            min: {
                args: 1,
                msg: "El semestre debe ser mayor que 0"
            },
            max: {
                args: 10,
                msg: "El semestre debe ser menor o igual a 10"
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
module.exports = User;
