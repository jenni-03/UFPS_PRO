import Usuario from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import sequelize from '../database/db.js';
import bcrypt from 'bcrypt';
import logger from '../middlewares/logger.js';

// Función encargada de crear el usuario administrador
const createAdminUser = async () => {

    try{

        await sequelize.transaction(async (t) => {

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

                const getSalt = await bcrypt.genSalt(11);
                const hashed = await bcrypt.hash('Director1234', getSalt);

                // Creamos el usuario
                const user  = await Usuario.create({
                    nombre: 'Jaider',
                    apellido: 'Oliveros',
                    codigo: '1152031',
                    email: 'jaidergustavoolmo@ufps.edu.co',
                    password: hashed,
                    tipo: 'director',
                    telefono: '5555555',
                    direccion: 'Mi hogar mi casa al lado de mi vecino',
                    documento: '1004758624',
                    celular: '3135687982',
                    rol_id: adminRole.id
                }, {transaction: t});

                logger.info('Usuario administrador creado correctamente');

            }


        });

    }catch(error){
        logger.error(`Error al crear usuario administrador: ${error.message}`);
    }

};

export default createAdminUser;