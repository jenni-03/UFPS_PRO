import Categoria from '../models/Categoria.js';
import Competencia from '../models/Competencia.js';
import Sequelize from '../database/db.js';
import Pregunta from '../models/Pregunta.js';


/* --------- getCategorias function -------------- */

const getCategorias = async (req, res, next) => {

    // Estado
    const state = req.query.estado || true;

    try{

        // Obtenemos las categorias
        const categorias = await Categoria.findAll({
            where: {
                estado: state
            },
            attributes: [
                ['id', 'id'],
                ['nombre', 'nombre'],
                ['estado', 'estado'],
                [Sequelize.fn('COUNT', Sequelize.col('Preguntas.id')), 'total_preguntas']
            ],
            include: [
                {
                    model: Competencia,
                    attributes: ['nombre']
                },
                {
                    model: Pregunta,
                    attributes: [],
                    where: {
                        categoria_id: Sequelize.col('Categorias.id') // Condicional para la relación
                    },
                    required: false
                }
            ],
            group: ['Categorias.id', 'Categorias.nombre']
        });


        // Respondemos al usuario
        res.status(200).json(categorias);

    }catch(err){
        const errorGetCat = new Error(`Ocurrio un problema al obtener las categorias - ${err.message}`);
        errorGetCat.stack = err.stack; 
        next(errorGetCat);
    }

};


/* --------- getCategoriaById function -------------- */

const getCategoriaById = async (req, res, next) => {

    // Obtenemos el id de la categoria a obtener
    const {id} = req.params;

    try{

        // Obtenemos y verificamos la categoria
        const categoria = await Categoria.findByPk(id, {
            attributes: ['nombre', 'descripcion', 'estado'],
            include: {
                model: Competencia,
                attributes: ['nombre']
            }
        });

        if(!categoria){
            req.log.warn(`El usuario con id ${req.user.id} intento acceder a una categoria no especificada`);
            return res.status(400).json({error: 'No se encuentra ninguna categoria con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(categoria);

    }catch(err){
        const errorGetCatId = new Error(`Ocurrio un problema al obtener los datos de la categoria especificada - ${err.message}`);
        errorGetCatId.stack = err.stack; 
        next(errorGetCatId);
    }

};


/* --------- createCategoria function -------------- */

const createCategoria = async (req, res, next) => {

    // Obtenemos los datos de la categoria a crear
    const {nombre, descripcion, competencia_id} = req.body;

    try{

        const [categoriaExist, competencia_exist] = await Promise.all([

            Categoria.findOne({
                where: {
                    nombre
                }
            }),
            Competencia.findByPk(competencia_id)

        ]);

        // Comprobamos que el nombre de la categoria sea unico
        if(categoriaExist) return res.status(400).json({error: `El nombre de la categoria ${nombre} ya se encuentra registrado`});
        

        // Comprobamos que el id de la competencia corresponda a uno válido
        if(!competencia_exist) {
            req.log.warn(`Intento de asociacion de una competencia inexistente a una nueva categoria por parte del usuario con id ${req.user.id}`);
            return res.status(400).json({error: 'El id de competencia proporcionado no corresponde con ninguna existente'});
        }
        

        // Creamos la categoria
        await Categoria.create({
            nombre: nombre.toUpperCase(),
            descripcion,
            competencia_id
        });

        // Respondemos al usuario
        res.status(200).json({ message: 'Categoria creada exitosamente' });

    }catch(err){
        const errorCreateCat = new Error(`Ocurrio un problema al crear la categoria - ${err.message}`);
        errorCreateCat.stack = err.stack; 
        next(errorCreateCat);
    }

};


/* --------- updateCategoria function -------------- */

const updateCategoria = async (req, res, next) => {

    // Obtenemos el id de la categoria a actualizar
    const {id} = req.params;

    // Obtenemos los datos a actualizar
    const {nombre, descripcion, estado, competencia_id} = req.body;

    try{

        const [categoria, categoriaExist, competencia_exist] = await Promise.all([

            Categoria.findByPk(id),

            Categoria.findOne({
                where: {
                    nombre
                }
            }),

            Competencia.findByPk(competencia_id)

        ]);
        
        // Verificamos la categoria
        if(!categoria) {
            req.log.warn(`El usuario con id ${req.user.id} intento acceder a una categoria no especificada`);
            return res.status(400).json({error: 'No se encuentra ninguna categoria con el id especificado'})
        };
        
        // Comprobamos que el nombre sea unico 
        if(categoriaExist && categoriaExist.nombre !== categoria.nombre) return res.status(400).json({error: `El nombre de la categoria ${nombre} ya se encuentra registrado`});
        

        // Comprobamos que el id de la competencia corresponda a uno válido
        if(!competencia_exist) {
            req.log.warn(`Intento de asociacion de una competencia inexistente a una nueva categoria por parte del usuario con id ${req.user.id}`);
            return res.status(400).json({error: 'El id de la competencia proporcionado no corresponde con ninguna existente'})
        };
    
        // Actualizamos la categoria
        await categoria.update({
            nombre: nombre.toUpperCase(),
            descripcion,
            estado,
            competencia_id
        });

        // Respondemos al usuario
        res.status(200).json({ message: 'Categoria actualizada correctamente' });

    }catch(err){
        const errorUpdateCat = new Error(`Ocurrio un problema al actualizar la categoria - ${err.message}`);
        errorUpdateCat.stack = err.stack; 
        next(errorUpdateCat);
    }

};

const controller = {

    getCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria

}

export default controller;