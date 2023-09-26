import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import password_generator from 'generate-password';
import encryptPasswd from '../util/encryptPassword.js';
import generateCorreo from '../util/emailGenerator.js';
import bcrypt from 'bcrypt';


/* --------- getStudents function -------------- */

const getStudents =  async (req, res, next) => {

    // Obtenemos el estado de los estudiantes a filtrar
    const state = req.query.estado || true;

    try {

        // Consultamos a los estudiantes
        const students = await Usuario.findAll({
            where: {
                tipo: 'Estudiante', 
                estado: state
            },
            attributes: ['id', 'nombre', 'apellido', 'email', 'semestre', 'codigo', 'estado']
        });

        // Respondemos al usuario
        res.status(200).json(students);

    } catch (error) {
        next(new Error(`Ocurrio un problema al obtener los estudiantes: ${error.message}`));
    }
    
};


/* --------- getStudentById function -------------- */

const getStudentById = async (req, res, next) => {
    
    // Obtenemos el id del estudiante
    const { id } = req.params;

    try {

        // Obtenemos el estudiante 
        const student = await Usuario.findOne({
            where: {
                id,
                tipo: "Estudiante"
            }
        });

        if (!student){
            return res.status(400).json({ error: 'No es posible identificar al estudiante especificado' });
        }

        // Respondemos al usuario
        res.status(200).json({
            nombre: student.nombre,
            apellido: student.apellido,
            codigo: student.codigo,
            email: student.email,
            tipo: student.tipo,
            estado: student.estado
        });

    } catch (error) {
        next(new Error(`Ocurrio un problema al obtener la informacion del estudiante especificado: ${error.message}`));
    }

};


/* --------- updateStudentData function -------------- */

const updateStudentData = async (req, res, next) => {

    // Obtenemos el id del estudiante
    const { id } = req.user;

    // Obtenemos los datos a actualizar
    const {nombre, apellido} = req.body; 

    try {

        // Obtenemos el estudiante y verificamos su existencia
        const student = await Usuario.findOne({
            where: {
                id,
                tipo: "Estudiante"
            }
        });
        
        // Actualizamos el estudiante
        await student.update({
            nombre,
            apellido
        });

        // Respondemos a la petición
        res.status(200).json({ message: "Actualización realizada correctamente" });

    } catch (error) {
        next(new Error(`Ocurrio un problema al actualizar el estudiante especificado: ${error.message}`));
    }
}


// ------------ Métodos para el Director ------------------


/* --------- createStudent function -------------- */

const createStudent =  async (req, res, next) => {

    // Obtenemos los datos de el estudiante a crear
    const {nombre, apellido, codigo, email, semestre} = req.body; 

    try {

        //Validamos que el código y email sea único
        const studentExist = await Usuario.findOne({
            where: {
                [Op.or]: [
                    {codigo},
                    {email}
                ]
            }
        });

        if(studentExist){
            return res.status(400).json({error: 'El usuario ya se encuentra registrado'});
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
            tipo: 'Estudiante',
            semestre,
            rol_id: 2
        });

        // Enviamos correo de confirmación de registro
        await generateCorreo(`${nombre} ${apellido}`, email, password);

        // Respondemos al usuario
        res.status(200).json({ message: 'Usuario creado exitosamente' });

    } catch (error) {
        next(new Error(`Ocurrio un problema al intentar crear el estudiante: ${error.message}`));
    }

};


/* --------- updateStudentDir function -------------- */

const updateStudentDataDir = async (req, res, next) => {

    //Obtenemos el id del estudiante a actualizar
    const { id } = req.params;

    // Obtenemos los datos a actualizar
    const {nombre, apellido, codigo, email, semestre, estado} = req.body; 

    try {

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
            return res.status(400).json({error: "El codigo y email de el estudiante deben ser unico"});
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
        return res.status(200).json({ message: 'Estudiante actualizado correctamente' });

    } catch (error) {
        next(new Error(`Ocurrio un problema al intentar actualizar el estudiante: ${error.message}`));
    }
}


/* --------- getDirectors function -------------- */

const getDirectors =  async (req, res, next) => {

    try {

        //Obtenemos los directores
        const directors = await Usuario.findAll({
            where: { tipo: 'Director' }
        })

        // Respondemos al usuario
        res.status(200).json(directors);

    } catch (error) {
        next(new Error(`Ocurrio un problema al obtener los datos de los directores: ${error.message}`));
    }
};


/* --------- getDirectorById function -------------- */

const getDirectorById = async (req, res) => {

    //Obtenemos el id del director
    const {id} = req.params;

    try {

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
        next(new Error(`Ocurrio un problema al obtener los datos del director: ${error.message}`));
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

const controller = { 

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

export default controller;