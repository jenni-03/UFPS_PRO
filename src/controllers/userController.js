import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';
import { uploadImage, updateFile } from '../libs/cloudinary.js';


/* --------- getProfile function -------------- */

const getProfile = async (req, res, next) => {

    // Obtenemos el identificador del usuario 
    const { id, type } = req.user;

    try{

        let excluded_attributes;

        type === 'Director' ? excluded_attributes = ['password', 'rol_id', 'estado', 'semestre', 'fecha_creacion', 'fecha_actualizacion', 'fecha_inactivacion'] : excluded_attributes = ['telefono', 'direccion', 'documento', 'celular', 'foto_perfil', 'password', 'rol_id', 'estado', 'fecha_creacion', 'fecha_actualizacion', 'fecha_inactivacion'];

        // Buscamos el usuario
        const existUser = await Usuario.findByPk(id, {
            attributes: { exclude: excluded_attributes }
        });

        return res.status(200).json(existUser);

    }catch(error){
        const errorGetPerfil = new Error(`Ocurrio un problema al obtener el perfil del usuario - ${error.message}`);
        errorGetPerfil.stack = error.stack; 
        next(errorGetPerfil);
    }

};


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
            attributes: ['id', 'nombre', 'codigo', 'apellido', 'email', 'estado']
        });

        // Respondemos al usuario
        res.status(200).json(students);

    } catch (error) {
        const errorGetEst = new Error(`Ocurrio un problema al intentar obtener los estudiantes - ${error.message}`);
        errorGetEst.stack = error.stack; 
        next(errorGetEst);
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
            },
            attributes: ['nombre', 'apellido', 'email', 'semestre', 'codigo', 'estado']
        });

        if (!student){
            req.log.warn('Intento de acceso a estudiante inexistente');
            return res.status(400).json({ error: 'No es posible identificar al estudiante especificado' });
        }

        // Respondemos al usuario
        res.status(200).json(student);

    } catch (error) {
        const errorGetEstId = new Error(`Ocurrio un problema al intentar obtener la información del estudiante especificado - ${error.message}`);
        errorGetEstId.stack = error.stack; 
        next(errorGetEstId);
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
        const errorUpdtEst = new Error(`Ocurrio un problema al actualizar el estudiante especificado - ${error.message}`);
        errorUpdtEst.stack = error.stack; 
        next(errorUpdtEst);
    }
}


// ------------ Métodos para el Director (sobre el estudiante) ------------------


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
            req.log.warn('Intento de acceso a estudiante inexistente');
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

        if(studentExist && studentExist.id !== student.id){
            req.log.warn(`El usuario con id ${req.user.id} esta tratando de asignar un codigo o email de estudiante actualmente en uso`);
            return res.status(400).json({error: "El código y email del estudiante deben ser únicos"});
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
        const errorUpdtEstDir = new Error(`Ocurrio un problema al intentar actualizar el estudiante - ${error.message}`);
        errorUpdtEstDir.stack = error.stack; 
        next(errorUpdtEstDir);
    }
}


/* --------- getDirectors function -------------- */

const getDirectors =  async (req, res, next) => {

    try {

        //Obtenemos los directores
        const directors = await Usuario.findAll({
            where: { tipo: 'Director' },
            attributes: [ 'id', 'nombre', 'apellido', 'codigo', 'email', 'celular', 'estado' ]
        })

        // Respondemos al usuario
        res.status(200).json(directors);

    } catch (error) {
        const errorGetDir = new Error(`Ocurrio un problema al intentar obtener los datos de los directores - ${error.message}`);
        errorGetDir.stack = error.stack; 
        next(errorGetDir);
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
            },
            attributes: [ 'nombre', 'apellido', 'codigo', 'email', 'celular', 'direccion', 'telefono', 'documento', 'estado' ]
        });

        if(!director){
            return res.status(400).json({error: 'No se encuentra ningun director asociado con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(director);

    } catch (error) {
        const errorGetDirId = new Error(`Ocurrio un problema al intentar obtener los datos del director - ${error.message}`);
        errorGetDirId.stack = error.stack; 
        next(errorGetDirId);
    }
};


/* --------- updateDirector function -------------- */

const updateDirector = async (req, res, next) => {

    //Obtenemos el id del director a actualizar
    const {id} = req.user;

    // Obtenemos los datos a actualizar
    const { nombre, apellido, codigo, telefono, direccion, documento, celular } = req.body;

    try {

        //Obtenemos y verificamos el director
        const director = await Usuario.findOne({
            where: {
                id,
                rol_id: 1
            }
        });

        //Comprobamos que no exista un director con el mismo codigo y documento
        const directorExist = await Usuario.findOne({
            where: {
                [Op.or]: [
                    {codigo},
                    {documento}
                ]
            }
        });

        if(directorExist && directorExist.id !== director.id){
            req.log.warn(`Intento de uso de credenciales de administrador ya registradas`);
            res.status(400).json({error: "El codigo y documento de el director deben ser unicos"});
        }

        //Actualizamos el director
        await director.update({
            nombre,
            apellido,
            codigo,
            telefono,
            direccion,
            documento,
            celular
        });

        //Respondemos a la petición
        res.status(200).json({ message: "Datos actualizados correctamente" });

    } catch (error) {
        const errorUpdtDir = new Error(`Ocurrio un problema al actualizar los datos del director - ${error.message}`);
        errorUpdtDir.stack = error.stack; 
        next(errorUpdtDir);
    }
};


/* --------- updatePhotoDirector function -------------- */

const updatePhotoDirector = async (req, res, next) => {

    //Obtenemos el identificador del director
    const { id } = req.user;

    try {

        //Obtenemos el director
        const director = await Usuario.findByPk(id);
        
        // Variables de configuración de la imagen
        let result;
        let image;

        // Formateamos el nombre
        const imageName = req.file.filename.split('.')[0];

        if (director.foto_perfil === null) {
            result = await uploadImage(req.file.path, imageName);
        }else{
            result = await updateFile(req.file.path, director.foto_perfil.public_id);
        }

        // Definimos los atributos a almacenar
        image = {
            url: result.secure_url,
            public_id: result.public_id
        }

        // Actualizamos la foto
        await director.update({
            foto_perfil: image
        });
    
        res.status(200).json({
            message: "Tu foto ha sido actualizada correctamente",
            imageFile: `${director.foto_perfil.url}`
        });
    
    } catch (error) {
        const errorUpdtPhotoDir = new Error(`Ocurrio un problema al actualizar la foto del administrador - ${error.message}`);
        errorUpdtPhotoDir.stack = error.stack; 
        next(errorUpdtPhotoDir);
    }
};


/* --------- updatePassword function -------------- */

const updatePassword = async (req, res, next) => {

    // Obtenemos el identificador del admin
    const { id } = req.user;

    // Obtenemos la contraseña actual y la nueva contraseña a actualizar
    const {password, newPassword} = req.body;

    try{

        // Verificamos la existencia del usuario
        const user = await Usuario.findByPk(id);

        // Comparamos la contraseña ingreasada
        const match = await bcrypt.compare(password, user.password);

        if(!match){
            req.log.warn('Uso de credenciales incorrectas al actualizar la contraseña')
            return res.status(400).json({error: `La contraseña ingresada no corresponde con la original`});
        }

        // Hasheamos la nueva contraseña
        const genSalt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(newPassword, genSalt);

        // Actualizamos la contraseña del administrador
        await user.update({
            password: hash
        });

        res.status(200).json({message:"Contraseña cambiada correctamente"});

    }catch(error){
        const errorUpdtPassDir = new Error(`Ocurrio un problema al intentar cambiar la contrasenia - ${error.message}`);
        errorUpdtPassDir.stack = error.stack; 
        next(errorUpdtPassDir);
    }

};


/* --------- deleteStudent function -------------- */

const deleteStudent = async (req, res, next) => {

    // Obtenemos el identificador del estudiante
    const { id } = req.params;

    try{

        // Verificamos la existencia del usuario
        const user = await Usuario.findByPk(id);

        if (!user){
            req.log.warn('Intento de desvinculación de un usuario inexistente');
            return res.status(400).json({error: 'No se encontro al usuario especificado'});
        }

        if (user.tipo !== 'Estudiante') return res.status(400).json({error: 'Acción no permitida'});

        // Eliminamos la cuenta del usuario
        await user.destroy();

        res.status(200).json({message: "El usuario ha sido desvinculado de la plataforma correctamente"});

    }catch(error){
        const errorDelUser = new Error(`Ocurrio un problema al intentar desvincular al estudiante - ${error.message}`);
        errorDelUser.stack = error.stack; 
        next(errorDelUser);
    }

};


const userController = { 

    getStudents,
    getStudentById,
    updateStudentData,
    updateStudentDataDir,
    getDirectors,
    getDirectorById,
    updateDirector,
    updatePhotoDirector,
    updatePassword,
    getProfile,
    deleteStudent

}

export default userController;