// Importamos los modelos a asociar
const User = require('../models/Usuario');
const Rol = require('../models/Rol');
const Inscripcion = require('../models/Inscripcion');
const Convocatoria = require('../models/Convocatoria');
const Resultado = require('../models/Resultado');
const Prueba = require('../models/Prueba');
const Categoria = require('../models/Categoria');
const Pregunta = require('../models/Pregunta');
const ConfiguracionCategoria = require('../models/ConfiguracionCategoria');
const Competencia = require('../models/Competencia');
const PruebaCompetencia = require('../models/PruebaCompetencia');
const PreguntaPrueba = require('../models/PreguntaPrueba');
const PasswordReset = require('../models/PasswordReset');


// Definimos la relación Usuario - PasswordReset
User.hasMany(PasswordReset, {foreignKey: 'usuario_id'});
PasswordReset.belongsTo(User, {
    foreignKey: 'usuario_id'
});

// Definimos la relación Usuario - Rol
Rol.hasMany(User, {foreignKey: 'rol_id'});
User.belongsTo(Rol, {
    foreignKey: 'rol_id'
});

// Definimos la relación Usuario - Inscripcion
User.hasMany(Inscripcion, {foreignKey: 'usuario_id'});
Inscripcion.belongsTo(User, {
    foreignKey: 'usuario_id'
});

// Definimos la relación Convocatoria - Inscripcion
Convocatoria.hasMany(Inscripcion, {foreignKey: 'convocatoria_id'});
Inscripcion.belongsTo(Convocatoria, {
    foreignKey: 'convocatoria_id'
});

// Definimos la relación Resultado - Inscripcion
Inscripcion.hasMany(Resultado, {foreignKey: 'inscripcion_id'});
Resultado.belongsTo(Inscripcion, {
    foreignKey: 'inscripcion_id'
});

// Definimos la relación Prueba - Convocatoria
Prueba.hasMany(Convocatoria, {foreignKey: 'prueba_id'});
Convocatoria.belongsTo(Prueba, {
    foreignKey: 'prueba_id'
});

// Definimos la relación Categoria - Resultado
Categoria.hasMany(Resultado, {foreignKey: 'categoria_id'});
Resultado.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});

// Definimos la relación Categoria - Pregunta
Categoria.hasMany(Pregunta, {foreignKey: 'categoria_id'});
Pregunta.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});

// Definimos la relación Categoria - ConfiguracionCategoria
Categoria.hasMany(ConfiguracionCategoria, {foreignKey: 'categoria_id'});
ConfiguracionCategoria.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});

// Definimos la relación Prueba - ConfiguracionCategoria
Prueba.hasMany(ConfiguracionCategoria, {foreignKey: 'prueba_id'});
ConfiguracionCategoria.belongsTo(Prueba, {
    foreignKey: 'prueba_id'
});

// Definimos la relación Competencia - Categoria
Competencia.hasMany(Categoria, {foreignKey: 'competencia_id'});
Categoria.belongsTo(Competencia, {
    foreignKey: 'competencia_id'
});

// Definimos la relación Competencia - Prueba
Competencia.belongsToMany(Prueba, {through: PruebaCompetencia, foreignKey: 'competencia_id'});
Prueba.belongsToMany(Competencia, {through: PruebaCompetencia, foreignKey: 'prueba_id'});

// Definimos la relación Prueba - Pregunta
Prueba.belongsToMany(Pregunta, {through: PreguntaPrueba, foreignKey: 'prueba_id'});
Pregunta.belongsToMany(Prueba, {through: PreguntaPrueba, foreignKey: 'pregunta_id'});