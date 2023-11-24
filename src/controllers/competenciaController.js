import Competencia from '../models/Competencia.js';
import Categoria from '../models/Categoria.js';


/* --------- getCompetencias function -------------- */

const getCompetencias = async (req, res, next) => {

    // Estado
    const state = req.query.estado || true;

    try{

        // Obtenemos las competencias
        const competencias = await Competencia.findAll({
            where: {
                estado: state
            },
            attributes: ['id', 'nombre', 'estado'],
            include: {
                model: Categoria,
                attributes: ['nombre']
            }
        });

        // Respondemos al usuario
        res.status(200).json(competencias);

    }catch(err){
        const errorGetComp = new Error(`Ocurrio un problema al obtener las competencias - ${err.message}`);
        errorGetComp.stack = err.stack; 
        next(errorGetComp);
    }

};


/* --------- getCompetenciaById function -------------- */

const getCompetenciaById = async (req, res, next) => {

    // Obtenemos el id de la competencia a obtener
    const {id} = req.params;

    try{

        // Obtenemos y verificamos la competencia
        const competencia = await Competencia.findByPk(id, {
            attributes: ['nombre', 'descripcion', 'estado'],
            include: {
                model: Categoria,
                attributes: ['id', 'nombre']
            }
        });

        if(!competencia){
            req.log.warn(`El usuario con id ${req.user.id} intento acceder a una competencia no especificada`);
            return res.status(400).json({error: 'No se encuentra ninguna competencia con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(competencia);

    }catch(err){
        const errorGetCompId = new Error(`Ocurrio un problema al obtener los datos de la competencia especificada - ${err.message}`);
        errorGetCompId.stack = err.stack; 
        next(errorGetCompId);
    }

};


/* --------- createCompetencia function -------------- */

const createCompetencia = async (req, res) => {

    // Obtenemos los datos de la competencia a crear
    const {nombre, descripcion} = req.body;

    try{

        // Comprobamos que el nombre sea unico 
        const compFound = await Competencia.findOne({
            where: {
                nombre
            }
        });

        if(compFound){
            req.log.warn(`El usuario con id ${req.user.id} intento crear una competencia ya registrada`);
            return res.status(400).json({error: `El nombre de la competencia ${nombre} ya se encuentra registrado`});
        }

        // Creamos la competencia
        await Competencia.create({
            nombre: nombre.toUpperCase(),
            descripcion
        });

        // Respondemos al usuario
        res.status(200).json({ message: 'Competencia creada exitosamente' });

    }catch(err){
        const errorCreateComp = new Error(`Ocurrio un problema al crear la competencia - ${err.message}`);
        errorCreateComp.stack = err.stack; 
        next(errorCreateComp);
    }

};


/* --------- updateCompetencia function -------------- */

const updateCompetencia = async (req, res, next) => {

    // Obtenemos el id de la competencia a actualizar
    const {id} = req.params;

    // Obtenemos los datos a actualizar
    const {nombre, descripcion, estado} = req.body;

    try{

        // Hacemos las verificaciones de la competencia en paralelo
        const [competencia, compFound] = await Promise.all([

            Competencia.findByPk(id),
            Competencia.findOne({
                where: {
                    nombre
                }
            })

        ]);

        // verificamos la competencia
        if(!competencia) {
            req.log.warn(`El usuario con id ${req.user.id} intento acceder a una competencia inexistente.`);
            return res.status(400).json({error: 'No se encuentra ninguna competencia con el id especificado'});
        }
        
        // Comprobamos que el nombre sea unico 
        if(compFound && competencia.nombre !== compFound.nombre) {
            req.log.warn(`El usuario con id ${req.user.id} intento usar un nombre de competencia ya registrado`);
            return res.status(400).json({error: `El nombre de competencia ${nombre} ya se encuentra registrado`});
        }
        
        // Actualizamos la competencia
        await competencia.update({
            nombre: nombre.toUpperCase(),
            descripcion,
            estado
        });

        // Si la competencia es desactivada, deshabilitamos todas las categorias asociadas a esta
        if(!competencia.estado){

            await Categoria.update({
                estado: false
            }, {
                where: {
                    competencia_id: competencia.id
                }
            });

        }

        // Respondemos al usuario
        res.status(200).json({message: 'Competencia actualizada correctamente' });

    }catch(err){
        const errorUpdateComp = new Error(`Ocurrio un problema al actualizar la competencia - ${err.message}`);
        errorUpdateComp.stack = err.stack; 
        next(errorUpdateComp);
    }

};


/* --------- removeCategoria function -------------- */

const unlinkCategoria = async (req, res, next) => {

    // Obtenemos el identificador de la categoria
    const { categoria_id } = req.body;

    try{

        // Obtenemos la categoria a desasociar
        const categoria = await Categoria.findByPk(categoria_id, {
            include: [ Competencia ]
        });
            

        // verificamos la categoria
        if(!categoria) {
            req.log.warn(`El usuario con id ${req.user.id} intento desvincular una categoria inexsistente o no asociada a la competencia especificada.`);
            return res.status(400).json({error: 'No se encuentra ninguna categoria con el id especificado'});
        }
        
        // Desvinculamos la categoria de su competencia
        await categoria.setCompetencia(null);

        // Respondemos al usuario
        res.status(200).json({message: `Categoría ${categoria.nombre} desvinculada exitosamente` });

    }catch(err){
        const errorUnlinkCat = new Error(`Ocurrio un problema al desvincular la categoria de su competencia - ${err.message}`);
        errorUnlinkCat.stack = err.stack; 
        next(errorUnlinkCat);
    }

};


const controller = {

    getCompetencias,
    getCompetenciaById,
    createCompetencia,
    updateCompetencia,
    unlinkCategoria

}

export default controller;