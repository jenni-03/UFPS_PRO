const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');
const password_generator = require('generate-password');
const encryptPasswd= require('../util/encryptPassword');
const generateCorreo = require('../util/emailGenerator');
const bcrypt = require('bcrypt');


/* --------- getStudents function -------------- */

const getStudents =  async (req, res) => {

    try {

        // Estado
        const state = req.query.estado || true;

        //Obtenemos los estudiantes
        const students = await Usuario.findAll({
            where: {
                tipo: 'estudiante', 
                estado: state
            },
            attributes: ['id', 'nombre', 'apellido', 'email', 'semestre', 'codigo', 'estado']
        });

        // Respondemos al usuario
        res.status(200).json(students);

    } catch (error) {
        return res.status(500).json({ error: `Error al obtener los estudiantes: ${error.message}` });
    }
    
};


/* --------- getStudentById function -------------- */

const getStudentById = async (req, res) => {
    
    try {

        //Obtenemos el id del estudiante
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexId.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

        //Obtenemos el estudiante y verificamos su existencia
        const student = await Usuario.findOne({
            where: {
                id,
                rol_id: 2
            }
        });

        if(!student){
            return res.status(400).json({error: 'No se encuentra ningún estudiante asociado con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(student);

    } catch (error) {
        return res.status(500).json({ error: `Error al obtener el estudiante especificado: ${error.message}` });
    }

};


/* --------- updateStudentData function -------------- */

const updateStudentData = async (req, res) => {

    try {

        //Obtenemos el id del estudiante a actualizar
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexId.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

        //Obtenemos el estudiante y verificamos su existencia
        const student = await Usuario.findOne({
            where: {
                id,
                rol_id: 2
            }
        });

        if(!student){
            return res.status(400).json({error: 'No se encuentra ningun estudiante asociado con el id especificado'});
        }

        // Obtenemos los datos a actualizar
        const {nombre, apellido} = req.body;

        // Validamos los datos obtenidos
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/; // Validación de nombres y apellidos

        if(!regexData.test(nombre) || !regexData.test(apellido)){
            return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
        }
        
        //Actualizamos el estudiante
        await student.update({
            nombre,
            apellido
        });

        //Respondemos a la petición
        res.status(200).json(student);

    } catch (error) {
        return res.status(500).json({ error: `Error al actualizar los datos: ${error.message}` });
    }
}


// ------------ Métodos para el Director ------------------


/* --------- createStudent function -------------- */

const createStudent =  async (req, res) => {

    try {

        // Obtenemos los datos de el estudiante a crear
        const {nombre, apellido, codigo, email, semestre} = req.body;

        // Validamos los datos obtenidos
        if(!nombre || !apellido || !codigo || !email || !semestre){
            return res.status(400).json({error: 'Todos los campos son requeridos'});
        } 

        const regexNum = /^[0-9]+$/;
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if(!regexData.test(nombre) || !regexData.test(apellido) || !regexNum.test(codigo) || !regexNum.test(semestre)){
            return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
        }

        //Validamos que el código y email sea único
        const studentExist = await Usuario.findOne({
            where: {
                [Op.or]: [
                    {codigo},
                    {email}
                ],
                tipo: 'estudiante'
            }
        });

        if(studentExist){
            return res.status(400).json({error: 'El codigo y email del estudiante deben ser unicos'});
        }

        // Validamos la existencia del estudiante
        const estudianteExist = await Usuario.findOne({
            where: {
                nombre,
                apellido,
                email,
                codigo,
                tipo: 'estudiante'
            }
        });

        if(estudianteExist){
            return res.status(400).json({error: 'El estudiante ya se encuentra registrado'});
        }

        // Generamos la contraseña
        const password = password_generator.generate({
            length: 15,
            numbers: true
        });

        // Ciframos la contraseña
        const hashedPassword = await encryptPasswd(password);

        // Creamos el usuario
        const student = await Usuario.create({
            nombre,
            apellido,
            codigo,
            email,
            password: hashedPassword,
            tipo: 'estudiante',
            semestre,
            rol_id: 2
        });

        // Enviamos correo de confirmación de registro
        await generateCorreo(`${nombre} ${apellido}`, email, password);

        // Respondemos al usuario
        res.status(200).json(student);

    } catch (error) {
        return res.status(500).json({error: `Error al crear el estudiante: ${error.message}`});
    }

};


/* --------- updateStudentDir function -------------- */

const updateStudentDataDir = async (req, res) => {

    try {

        //Obtenemos el id del estudiante a actualizar
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexNum = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexNum.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

        // Obtenemos el estudiante y verificamos su existencia
        const student = await Usuario.findOne({
            where: {
                id,
                rol_id: 2
            }
        });

        if(!student){
            return res.status(400).json({error: 'No se encuentra ningun estudiante asociado con el id especificado'});
        }

        // Obtenemos los datos a actualizar
        const {nombre, apellido, codigo, email, semestre, estado} = req.body;

        // Validamos los datos obtenidos
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if(!regexData.test(nombre) || !regexData.test(apellido) || !regexNum.test(codigo) || !regexNum.test(semestre)){
            return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
        }

        // Comprobamos que no exista un estudiante con el mismo codigo o email
        const studentExist = await Usuario.findOne({
            where: {
                [Op.or]: [
                    {codigo},
                    {email}
                ]
            }
        })

        if(studentExist && studentExist.nombre.toLowerCase() !== student.nombre.toLowerCase()){
            return res.status(400).json({error: "El codigo y email de el estudiante debe ser unico"});
        }

        // Actualizamos el estudiante
        await student.update({
            nombre,
            apellido,
            codigo,
            email,
            semestre,
            estado
        });

        // Respondemos a la petición
        return res.status(200).json(student);

    } catch (error) {
        return res.status(500).json({error: `Error al actualizar los datos del estudiante: ${error.message}`})
    }
}


/* --------- getDirectors function -------------- */

const getDirectors =  async (req, res) => {

    try {

        //Obtenemos los directores
        const directors = await Usuario.findAll({
            where: {tipo: 'director'}
        })

        // Respondemos al usuario
        res.status(200).json(directors);

    } catch (error) {
        return res.status(500).json({error: `Error al obtener los directores: ${error.message}`});
    }
};


/* --------- getDirectorById function -------------- */

const getDirectorById = async (req, res) => {

    try {

        //Obtenemos el id del director
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexId.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

        // Obtenemos el director y validamos su existencia
        const director = await Usuario.findOne({
            where: {
                id,
                rol_id: 1
            }
        });

        if(!director){
            return res.status(400).json({error: 'No se encuentra ningun director asociado con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(director);

    } catch (error) {
        return res.status(500).json({error: `Error al obtener un director por id: ${error.message}`});
    }
};


/* --------- updateDirector function -------------- */

const updateDirector = async (req, res) => {

    try {

        //Obtenemos el id del director a actualizar
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexNum = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexNum.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

        //Obtenemos y verificamos el director
        const director = await Usuario.findOne({
            where: {
                id,
                rol_id: 1
            }
        });

        if(!director){
            return res.status(400).json({error: 'No se encuentra ningun director asociado con el id especificado'});
        }

        // Obtenemos los datos a actualizar
        const {nombre, apellido, codigo, email, telefono, direccion, documento, celular, estado} = req.body;

        // Validamos los datos obtenidos
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if(!regexData.test(nombre) || !regexData.test(apellido) || !regexNum.test(codigo) || !regexNum.test(telefono) || !regexNum.test(documento) || !regexNum.test(celular)){
           return res.status(400).json({error: 'La sintaxis de los datos ingresados es incorrecta'});
        }

        //Comprobamos que no exista un director con el mismo codigo y documento
        const directorExist = await Usuario.findOne({
            where: {
                [Op.or]: [
                    {codigo},
                    {email},
                    {documento}
                ]
            }
        });

        if(directorExist && directorExist.id !== director.id){
            res.status(400).json({error: "El codigo y documento de el director deben ser unicos"});
        }

        //Actualizamos el director
        await director.update({
            nombre,
            apellido,
            codigo,
            email,
            telefono,
            direccion,
            documento,
            celular,
            estado
        });

        //Respondemos a la petición
        res.status(200).json(director);

    } catch (error) {
        return res.status(500).json({error: `Error al actualizar la información del director: ${error.message}`});
    }
};


/* --------- updatePhotoDirector function -------------- */

const updatePhotoDirector = async (req, res) => {

    try {

        //Obtenemos el id del director a actualizar
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexNum = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexNum.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

        //Obtenemos el director
        const director = await Usuario.findOne({
            where: {
                id,
                rol_id: 1
            }
        });

        if(!director){
            return res.status(400).json({error: 'No se encuentra ningun director asociado con el id especificado'});
        }

        await director.update({
            foto_perfil: req.file.filename
        });
    
        res.status(200).json({
            message: "Tu foto ha sido actualizada correctamente",
            imageFile: `https://apisimulador-production.up.railway.app/${req.file.filename}`
        });
    
    } catch (error) {
        return res.status(500).json({error: `Error al actualizar la foto de administrador: ${error.message}`});
    }
};


/* --------- updatePassword function -------------- */

const updatePassword = async (req, res) => {

    try{

        // Obtenemos el email del usuario
        const {email, password, newPassword} = req.body

        // Verificamos la existencia del usuario
        const user = await Usuario.findOne({
            where: {
                email
            }
        });

        if(!user){
            return res.status(400).json({error: `El email del usuario no se encuentra registrado`});
        }

        // Comparamos la contraseña ingreasada
        const match = await bcrypt.compare(password, user.password);

        if(!match){
            return res.status(400).json({error: `La contraseña ingresada no corresponde con la original`});
        }

        // Hasheamos la nueva contraseña
        const genSalt = await bcrypt.genSalt(11);
        const hash = await bcrypt.hash(newPassword, genSalt);

        // Actualizamos la contraseña
        await user.update({
            password: hash
        });

        res.status(200).json({message:"Contraseña cambiada correctamente"});

    }catch(error){
        return res.status(500).json({error: `Error al cambiar contraseña: ${error}`})
    }

};


module.exports = {
    getStudents,
    getStudentById,
    updateStudentData,
    createStudent,
    updateStudentDataDir,
    getDirectors,
    getDirectorById,
    updateDirector,
    updatePhotoDirector,
    updatePassword
}
