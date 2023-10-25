import Prueba from '../models/Prueba.js';
import Competencia  from '../models/Competencia.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';
import { validate_percentage_categories, asignValueCategories } from '../util/validateDataCategories.js';
import { asignCompetences, asignQuestions } from '../util/createTestQuestion.js';
import sequelize from '../database/db.js';
import Categoria from '../models/Categoria.js';


/* --------- getAllTests function -------------- */

const getAllTests = async (req, res, next) => {

    // Obtenemos el estado
    const state = req.query.estado || true;

    try{ 

        // Obtenemos todas las pruebas registradas en la BD
        const pruebas = await Prueba.findAll({
            where: {
                estado: state
            },
            attributes: ['id', 'nombre', 'semestre', 'total_preguntas'],
            include: {
                model: Competencia,
                attributes: ['nombre']
            }
        });

        // Respondemos al usuario
        res.status(200).json(pruebas)

    }catch(error){
        next(new Error(`Ocurrio un problema al obtener las pruebas: ${error.message}`));
    }

};


/* --------- getTestId function -------------- */

const getTestId = async (req, res, next) => {

    //Obtenemos el id del estudiante
    const {id} = req.params;

    try{

        // Obtenemos la prueba y verificamos su existencia
        const prueba = await Prueba.findByPk(id, {
            include: {
                model: ConfiguracionCategoria,
                attributes: ['categoria_id', 'valor_categoria'],
                include: [
                    {
                        model: Categoria,
                        attributes: ['nombre']
                    }
                ]
            },
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'estado', 'puntaje_total']
        });

        if(!prueba){
            return res.status(400).json({error: 'No se encontro ninguna prueba con el id especificado'});
        }

        // Respondemos al usuario
        res.status(200).json(prueba);

    }catch(error){
        next(new Error(`Ocurrio un problema al obtener la prueba por su identificador: ${error.message}`));
    }

};


/* --------- createTest function -------------- */

const createTest = async (req, res, next) => {

    // Obtenemos los datos de el estudiante a crear
    const { nombre, descripcion, semestre, duracion, total_preguntas, competencias, valorCategorias, categorias, preguntas } = req.body;

    try{

        // Validamos que el nombre sea único
        const existTest = await Prueba.findOne({
            where: {
                nombre
            }
        })

        if(existTest){
            return res.status(400).json({error: `El nombre de prueba: ${nombre}, ya se encuentra registrado`});
        }

        // Incializamos la transacción
        const result = await sequelize.transaction(async (t) => {

            // Creamos la prueba
            const prueba = await Prueba.create({
                nombre,
                descripcion,
                semestre,
                duracion,
                total_preguntas
            }, {transaction: t});

            // Asignamos las competencias
            await asignCompetences(prueba.id, competencias, t);

            // Configuramos el valor de las categorias
            await asignValueCategories(prueba.id, valorCategorias, competencias, t, prueba.semestre, prueba.total_preguntas);

            // Asignamos las preguntas
            await asignQuestions(categorias, preguntas, prueba.id, prueba.semestre, t);

            return prueba;

        });

        res.status(200).json({ message: `La Prueba: '${result.nombre}' fue creada exitosamente` });

    }catch(error){
        next(new Error(`Ocurrio un problema al crear la prueba: ${error.message}`));
    }

};


/* --------- updateTest function -------------- */

const updateTest = async (req, res, next) => {

    // Obtenemos el id de la prueba a actualizar 
    const {id} = req.params;

    // Obtenemos los datos a actualizar
    const { nombre, descripcion, duracion, estado, puntaje_total, valoresCategorias } = req.body;

    try{

        // Obtenemos la prueba y validamos su existencia
        const prueba = await Prueba.findByPk(id);

        if(!prueba){
            return res.status(400).json({error: 'No se encuentra ningun estudiante asociado con el id especificado'});
        }

        // Validamos que el nombre ingresado sea unico
        const pruebaExist = await Prueba.findOne({
            where: {
                nombre
            }
        });

        if(pruebaExist && pruebaExist.id !== prueba.id){
            return res.status(400).json({error: `El nombre de prueba ${nombre} ya se encuentra registrado`});
        }

        
        // Validamos que los nuevos porcentajes sean coincidentes
        let valor_total_categorias = 0;

        // Validamos los porcentajes ingresados para las categotrias 
        // no supere el maximo posible
        for (const valores of valoresCategorias){
                
            valor_total_categorias += validate_percentage_categories(valores);
            
        }

        // Validamos el valor total de las categorias
        if(valor_total_categorias > 100 || valor_total_categorias < 100){
            return res.status(400).json({error: 'El valor total de las categorias no coincide con el 100% designado'});
        }


        // Incializamos la transacción
        await sequelize.transaction(async (t) => {

            // Actualizamos los valores de la prueba
            await prueba.update({
                nombre,
                descripcion,
                duracion,
                estado,
                puntaje_total
            }, {
                transaction: t
            });


            // Actualizamos los valores de cada una de las categorias
            for(const valorCategoria of valoresCategorias){

                // Obtenemos el id de la categoria
                const categoriaId = valorCategoria[0];
                const percentage = valorCategoria[1];

                // Actualizamos la configuración
                await ConfiguracionCategoria.update({
                    valor_categoria: percentage
                }, {
                    where: {
                        categoria_id: categoriaId,
                        prueba_id: id
                    }, transaction: t
                });

            }

        });

        return res.status(200).json({ message: 'Prueba actualizada correctamente' });

    }catch(error){
        next(new Error(`Ocurrio un problema al actualizar la prueba: ${error.message}`));
    }

};


const testController = {
    getAllTests,
    getTestId, 
    createTest,
    updateTest
};

export default testController;