// Importamos los modelos a asociar
import User from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import Resultado from '../models/Resultado.js';
import Respuesta from '../models/Respuesta.js';
import PruebaCompetencia from '../models/PruebaCompetencia.js';
import Prueba from '../models/Prueba.js';
import PreguntaConfiguracion from '../models/PreguntaConfiguracion.js';
import Pregunta from '../models/Pregunta.js';
import PasswordReset from '../models/PasswordReset.js';
import Inscripcion from '../models/Inscripcion.js';
import Convocatoria from '../models/Convocatoria.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';
import Competencia from '../models/Competencia.js';
import Categoria from '../models/Categoria.js';


// Definimos la relación Usuario - PasswordReset
User.hasOne(PasswordReset, { foreignKey: 'usuario_id', onDelete: 'RESTRICT' });
PasswordReset.belongsTo(User, {
    foreignKey: 'usuario_id'
});


// Definimos la relación Usuario - Rol
Rol.hasMany(User, { foreignKey: 'rol_id' , onDelete: 'RESTRICT' });
User.belongsTo(Rol, {
    foreignKey: 'rol_id'
});


// Definimos la relación Usuario - Inscripcion
User.hasMany(Inscripcion, { foreignKey: 'usuario_id', onDelete: 'RESTRICT' });
Inscripcion.belongsTo(User, {
    foreignKey: 'usuario_id'
});


// Definimos la relación Resultado - Inscripcion
Inscripcion.hasMany(Resultado, { foreignKey: 'inscripcion_id', onDelete: 'RESTRICT' });
Resultado.belongsTo(Inscripcion, {
    foreignKey: 'inscripcion_id'
});


// Definimos la relación Categoria - Resultado
Categoria.hasMany(Resultado, { foreignKey: 'categoria_id', onDelete: 'RESTRICT' });
Resultado.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});


// Definimos la relación Convocatoria - Inscripcion
Convocatoria.hasMany(Inscripcion, { foreignKey: 'convocatoria_id', onDelete: 'RESTRICT' });
Inscripcion.belongsTo(Convocatoria, {
    foreignKey: 'convocatoria_id'
});


// Definimos la relación Inscripción - Respuesta
Inscripcion.hasMany(Respuesta, { foreignKey: 'inscripcion_id', onDelete: 'RESTRICT' });
Respuesta.belongsTo(Inscripcion, {
    foreignKey: 'inscripcion_id'
});


// Definimos la relación Pregunta - Respuesta
Pregunta.hasMany(Respuesta, { foreignKey: 'pregunta_id', onDelete: 'RESTRICT' });
Respuesta.belongsTo(Pregunta, {
    foreignKey: 'pregunta_id'
});


// Definimos la relación Prueba - Convocatoria
Prueba.hasMany(Convocatoria, { foreignKey: 'prueba_id', onDelete: 'RESTRICT' });
Convocatoria.belongsTo(Prueba, {
    foreignKey: 'prueba_id'
});


// Definimos la relación Competencia - Prueba
Competencia.belongsToMany(Prueba, {through: PruebaCompetencia, foreignKey: 'competencia_id'});
Prueba.belongsToMany(Competencia, {through: PruebaCompetencia, foreignKey: 'prueba_id'});


// Definimos la relación Competencia - Categoria
Competencia.hasMany(Categoria, { foreignKey: 'competencia_id', onDelete: 'RESTRICT' });
Categoria.belongsTo(Competencia, {
    foreignKey: 'competencia_id'
});


// Definimos la relación Prueba - ConfiguracionCategoria
Prueba.hasMany(ConfiguracionCategoria, { foreignKey: 'prueba_id', onDelete: 'RESTRICT' });
ConfiguracionCategoria.belongsTo(Prueba, {
    foreignKey: 'prueba_id'
});


// Definimos la relación Categoria - ConfiguracionCategoria
Categoria.hasMany(ConfiguracionCategoria, { foreignKey: 'categoria_id', onDelete: 'RESTRICT' });
ConfiguracionCategoria.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});


// Definimos la relación Categoria - Pregunta
Categoria.hasMany(Pregunta, { foreignKey: 'categoria_id', onDelete: 'RESTRICT' });
Pregunta.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});


// Definimos la relación Pregunta - ConfiguracionCategoria
Pregunta.belongsToMany(ConfiguracionCategoria, { through: PreguntaConfiguracion, foreignKey: 'pregunta_id' });
ConfiguracionCategoria.belongsToMany(Pregunta, { through: PreguntaConfiguracion, foreignKey: 'configuracion_categoria_id' });
