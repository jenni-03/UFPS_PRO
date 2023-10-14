import Prueba from '../models/Prueba.js';
import Competencia  from '../models/Competencia.js';
import Categoria from '../models/Categoria.js';
import PruebaCompetencia from '../models/PruebaCompetencia.js';
import ConfiguracionCategoria from '../models/ConfiguracionCategoria.js';
import { validCantQuestions, validate_percentage_categories } from '../util/validateDataCategories.js';
import { createTestQuestion } from '../util/createTestQuestion.js';
import sequelize from '../database/db.js';


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
            attributes: ['id', 'nombre', 'semestre', 'estado'],
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
                model: Competencia,
                attributes: ['nombre']
            }
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
    const { nombre, descripcion, semestre, duracion, total_preguntas } = req.body;

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
        await sequelize.transaction(async (t) => {

            // Creamos la prueba
            const prueba = await Prueba.create({
                nombre,
                descripcion,
                semestre,
                duracion,
                total_preguntas
            }, {transaction: t});

            res.status(200).json(prueba);

        });


    }catch(error){
        next(new Error(`Ocurrio un problema al crear la prueba: ${error.message}`));
    }

};


/* --------- asignCompetences function -------------- */

const asignCompetences = async (req, res, next) => {

    // Obtenemos los datos de el estudiante a crear
    const { pruebaId, competencias } = req.body;

    try{

        const errorMessage = 'El formato de las competencias por asignar no es correcto';

        if (competencias === undefined) return res.status(400).json({ error: 'Las competencias de la prueba son requeridas' });

        if (!Array.isArray(competencias) || competencias?.length === 0) return res.status(400).json({ error: errorMessage });

        if (!competencias.every(competencia => typeof competencia === 'number')) return res.status(400).json({ error: errorMessage });

        // Incializamos la transacción
        await sequelize.transaction(async (t) => {

            // Creamos las relaciones con competencias
            for (const competencia_id of competencias){

                await PruebaCompetencia.create({
                    prueba_id: pruebaId,
                    competencia_id
                }, {transaction: t});

            }

            res.status(200).json({ message: "La asignación de competencias a la prueba fue realizada con éxito" });

        });


    }catch(error){
        next(new Error(`Ocurrió un problema al asignar las competencias de la prueba: ${error.message}`));
    }

};


/* --------- asignValueCategories function -------------- */

const asignValueCategories = async (req, res, next) => {

    // Obtenemos los datos de el estudiante a crear
    const { pruebaId, valorCategorias, competencias } = req.body;

    try{

        const errorMessage = 'El formato de configuración de las categorias por asignar no es correcto';

        if (valorCategorias === undefined) return res.status(400).json({ error: 'La configuración de las categorias es requerida' });

        if (!Array.isArray(valorCategorias)) return res.status(400).json({ error: errorMessage });

        if (!valorCategorias.every(subArr => Array.isArray(subArr) && 
            subArr.every(valor => typeof valor === 'object' && !Array.isArray(valor) && valor !== null))) {
            return res.status(400).json({ error: errorMessage });
        }

        if (competencias.length !== valorCategorias.length) return res.status(400).json({ error: "La cantidad de valores a configurar no coincide con el número de competencias especificadas" });

        // Obtenemos la prueba a la que se aplicara la configuración
        const prueba = await Prueba.findByPk(pruebaId);


        // Variables de control para la cantidad de preguntas y valor por categoría
        let total_preguntas_categorias = 0;
        let valor_total_categorias = 0;

        const categorias = valorCategorias.flat();

        // Verficamos los valores de cada una de las categorias
        for(const categoria of categorias) {

            // Obtenemos la categoria y los datos a usar
            const { id, nombre } = await Categoria.findByPk(categoria.categoria_id);
            const cant_preguntas_necesarias = categoria.preguntas;
            const semestre = prueba.semestre;
            const total_prueba_preguntas = prueba.total_preguntas;

            // Validamos que la cantidad de preguntas y el porcentaje no supere el total de la prueba
            if (cant_preguntas_necesarias > total_prueba_preguntas){
                return res.status(400).json({ error: 'La cantidad de preguntas por categoria no puede superar al total de preguntas de la prueba' })
            }

            if (categoria.valor > 100){
                return res.status(400).json({ error: 'El valor porcentual por categoria no puede superar el 100%' });
            }

            // Validamos la cantidad de preguntas por categoria general ingresadas no supere las disponibles
            const cant_preguntas_actuales = await validCantQuestions(semestre, id);

            if (cant_preguntas_actuales < cant_preguntas_necesarias){
                return res.status(400).json({error: `La cantidad de preguntas solicitadas del ${semestre} semestre para la categoria ${nombre} supera las actualmente disponibles`});
            }

            total_preguntas_categorias += categoria.preguntas;
            valor_total_categorias += categoria.valor;

        }

        // Verificamos los valores globales de las categorias
        if (total_preguntas_categorias > prueba.total_preguntas || total_preguntas_categorias < prueba.total_preguntas){
            return res.status(400).json({error: 'El total de preguntas por categoria no coincide con el total especificado para la prueba'});
        }

        // Validamos el valor total de las categorias
        if(valor_total_categorias > 100 || valor_total_categorias < 100){
            return res.status(400).json({error: 'El valor total de las categorias no coincide con el 100% designado'});
        }


        // Incializamos la transacción
        await sequelize.transaction(async (t) => {

            for( const categoria of categorias ){

                // Creamos las configuraciones para las categorias
                await ConfiguracionCategoria.create({
                    cantidad_preguntas: categoria.preguntas,
                    valor_categoria: categoria.valor,
                    prueba_id: prueba.id,
                    categoria_id: categoria.categoria_id
                }, {transaction: t});

            }

            res.status(200).json({ message: "La configuración de las categorias de la prueba fue establecida con éxito" });

        });


    }catch(error){
        next(new Error(`Ocurrió un problema al asignar la configuración de las categorias a la prueba: ${error.message}`));
    }

};


/* --------- asignQuestions function -------------- */

const asignQuestions = async (req, res, next) => {

    // Obtenemos los datos de el estudiante a crear
    const { categorias, preguntas, pruebaId, semestre } = req.body;

    try{

        const errorMessage = 'El formato de los datos requeridos para asignar las preguntas no es correcto';

        if (categorias === undefined || preguntas === undefined) return res.status(400).json({ error: errorMessage });

        if (!Array.isArray(categorias) || !Array.isArray(preguntas)) return res.status(400).json({ error: errorMessage });

        if (categorias.length !== preguntas.length) return res.status(400).json({ error: errorMessage });

        // Incializamos la transacción
        await sequelize.transaction(async (t) => {

            // Comenzamos la asignación de preguntas por cada categoria
            for (let i = 0; i < categorias.length; i++) {
                createTestQuestion(pruebaId, categorias[i], preguntas[i], semestre);
            }

            res.status(200).json({ message: "La asignación de preguntas a la prueba fue realizada con éxito"});

        });


    }catch(error){
        next(new Error(`Ocurrió un problema al asignar las competencias de la prueba: ${error.message}`));
    }

};


/* --------- updateTest function -------------- */

const updateTest = async (req, res, next) => {

    // Obtenemos el id de la prueba a actualizar 
    const {id} = req.params;

    // Obtenemos los datos a actualizar
    const { nombre, descripcion, duracion, estado, valoresCategorias } = req.body;

    try{

        // Validamos que el nombre ingresado sea unico
        const pruebaExist = await Prueba.findOne({
            where: {
                nombre
            }
        });

        if(pruebaExist && pruebaExist.nombre !== nombre){
            return res.status(400).json({error: `El nombre de prueba ${nombre} ya se encuentra registrado`});
        }

        
        // Validamos que los nuevos porcentajes sean coincidentes
        let valor_total_categorias = 0;

        // Validamos que los datos ingresados para las categotrias 
        // de la competencia generica sean correctos (si aplica)
        for (const valores of valoresCategorias){
                
            valor_total_categorias += validate_percentage_categories(valores);;
            
        }

        // Validamos el valor total de las categorias
        if(valor_total_categorias > 100 || valor_total_categorias < 100){
            return res.status(400).json({error: 'El valor total de las categorias no coincide con el 100% designado'});
        }


        // Incializamos la transacción
        await sequelize.transaction(async (t) => {

            // Actualizamos los valores de la prueba
            await Prueba.update({
                nombre,
                descripcion,
                duracion,
                estado,
            }, {
                where: {
                    id
                },
                transaction: t
            });

            // Actualizamos los valores de las categorias Genericas (Si aplica)
            if(valoresGenericas && valoresGenericas.length > 0){

                for(const genericValue of valoresGenericas){

                    // Obtenemos el id de la categoria
                    const categoria_id = genericValue[0];
                    const percentage = genericValue[1];

                    // Actualizamos la configuración
                    await ConfiguracionCategoria.update({
                        valor_categoria: percentage
                    }, {
                        where: {
                            categoria_id,
                            prueba_id: id
                        }, transaction: t
                    });

                }
                
            }

            // Actualizamos los valores de las categorias Especificas (Si aplica)
            if(valoresEspecificas && valoresEspecificas.length > 0){

                for(const especificValue of valoresEspecificas){

                    // Obtenemos el id de la categoria
                    const categoria_id = especificValue[0];
                    const percentage = especificValue[1];

                    // Actualizamos la configuración
                    await ConfiguracionCategoria.update({
                        valor_categoria: percentage
                    }, {
                        where: {
                            categoria_id,
                            prueba_id: id
                        }, transaction: t
                    });

                }
                
            }

        });

        return res.status(200).json('Prueba actualizada correctamente');

    }catch(error){
        next(new Error(`Ocurrio un problema al actualizar la prueba: ${error.message}`));
    }

};


const testController = {
    getAllTests,
    getTestId, 
    createTest,
    asignCompetences,
    asignValueCategories,
    asignQuestions,
    updateTest
};

export default testController;