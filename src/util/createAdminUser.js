import Usuario from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import bcrypt from 'bcrypt';
import logger from '../middlewares/logger.js';
import validateData from './validateData.js';
import { directorSchema } from '../schemas/userSchema.js';

// Función encargada de crear el usuario administrador
const createAdminUser = async () => {

    try{


        // Verificamos que el admin no exista
        const admin = await Usuario.findOne({
            where: {
                email: 'jaidergustavoolmo@ufps.edu.co'
            }
        });

        if(!admin){

            // Obtenemos el rol de administrador 
            const adminRole = await Rol.findOne({
                where: {nombre: 'Administrador'}
            });

            // Validamos los datos
            const newAdmin = {

                nombre: 'Jaider',
                apellido: 'Oliveros',
                codigo: '1152031',
                email: 'jaidergustavoolmo@ufps.edu.co',
                tipo: 'Director',
                password: 'Director1234',
                telefono: '5555555',
                direccion: 'Mi hogar mi casa al lado de mi vecino',
                documento: '1004758624',
                celular: '3135687982',
                rol_id: adminRole.id

            }

            const getSalt = await bcrypt.genSalt(12);
            const hashed = await bcrypt.hash('Director1234', getSalt);

            const errors = validateData(directorSchema, newAdmin);

            // Reasignamos la contraseña 
            newAdmin.password = hashed;

            if (errors.length > 0) throw new Error(errors.join(', '));

            // Creamos el usuario - en caso de que todo haya ido bien
            await Usuario.create({
                nombre: newAdmin.nombre,
                apellido: newAdmin.apellido,
                codigo: newAdmin.codigo,
                email: newAdmin.email,
                password: newAdmin.password,
                tipo: newAdmin.tipo,
                telefono: newAdmin.telefono,
                direccion: newAdmin.direccion,
                documento: newAdmin.documento,
                celular: newAdmin.celular,
                rol_id: newAdmin.rol_id
            });

            logger.info('Usuario administrador creado correctamente');

        }


    }catch(error){
        console.log(error.stack);
        logger.error(`Error al crear usuario administrador: ${error.message}`);
    }

};

export default createAdminUser;