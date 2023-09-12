const Prueba = require('../models/Prueba');
const Competencia = require('../models/Competencia');
const PruebaCompetencia = require('../models/PruebaCompetencia');
const ConfiguracionCategoria = require('../models/ConfiguracionCategoria');
const {validateCategories, validCantQuestions, validate_percentage_categories} = require('../util/validateDataCategories');
const {createTestQuestion} = require('../util/createTestQuestion');
const sequelize = require('../database/db');


/* --------- getPruebas function -------------- */

const getPruebas = async (req, res) => {

    try{

        // Estado
        const state = req.query.estado || true;

        // Obtenemos todas las pruebas registradas en la BD
        const pruebas = await Prueba.findAll({
            where: {
                estado: state
            },
            attributes: ['id', 'nombre', 'semestre'],
            include: {
                model: Competencia,
                attributes: ['nombre']
            }
        });

        // Respondemos al usuario
        res.status(200).json(pruebas)

    }catch(err){
        return res.status(500).json({error: `Error al obtener las pruebas ${err.message}`});
    }

};


/* --------- getPruebasId function -------------- */

const getPruebasId = async (req, res) => {

    try{

        //Obtenemos el id del estudiante
        const {id} = req.params;

        // Verificamos el id de entrada
        const regexId = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexId.test(id)){
            return res.status(400).json({error: 'id no valido'});
        }

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

    }catch(err){
        return res.status(500).json({error: `Error al obtener la información de la prueba: ${err.message}`});
    }

};


/* --------- createPrueba function -------------- */

const createPrueba = async (req, res) => {

    try{

        // Obtenemos los datos de el estudiante a crear
        const {nombre, descripcion, semestre, duracion, competencias, total_preguntas, valoresGenericas, valoresEspecificas} = req.body;

        // Validamos los datos obtenidos

        const regexNum = /^[0-9]+$/;
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if(!Array.isArray(competencias) || competencias.length === 0 || !regexData.test(nombre) || !regexNum.test(semestre) || 
            !regexNum.test(duracion) || !regexNum.test(total_preguntas)){
            return res.status(400).json({error: 'La sintaxis de los datos es incorrecta'});
        }

        if(valoresGenericas.length === 0 && valoresEspecificas.length === 0){
            return res.status(400).json({error: 'Se debe seleccionar por lo menos una competencia'});
        }

        // Validamos que el nombre sea único
        const existPrueba = await Prueba.findOne({
            where: {
                nombre
            }
        })

        if(existPrueba){
            return res.status(400).json({error: `El nombre de prueba ${nombre} ya se encuentra registrado`});
        }

        // Variables de control para la cantidad de preguntas y valor por categoría
        let total_preguntas_categorias = 0;
        let valor_total_categorias = 0;

        // Validamos que los datos ingresados para las categotrias 
        // de la competencia generica sean correctos (si aplica)
        if(valoresGenericas && valoresGenericas.length > 0){

            const dataCategoriasGenericas = validateCategories(valoresGenericas, total_preguntas);
                
            total_preguntas_categorias += dataCategoriasGenericas[0];
            valor_total_categorias += dataCategoriasGenericas[1];
            
        }

        // Validamos que los datos ingresados para las categotrias 
        // de la competencia especifica sean correctos (si aplica)
        if(valoresEspecificas && valoresEspecificas.length > 0){

            const dataCategoriasEspecificas = validateCategories(valoresEspecificas, total_preguntas);

            total_preguntas_categorias += dataCategoriasEspecificas[0];
            valor_total_categorias += dataCategoriasEspecificas[1];

        }

        // Validamos la cantidad total de preguntas
        if(total_preguntas_categorias > total_preguntas || total_preguntas_categorias < total_preguntas){
            return res.status(400).json({error: 'El total de preguntas por categoria no coincide con el total especificado para la prueba'});
        }

        // Validamos el valor total de las categorias
        if(valor_total_categorias > 100 || valor_total_categorias < 100){
            return res.status(400).json({error: 'El valor total de las categorias no coincide con el 100% designado'});
        }

        // Validamos la cantidad de preguntas por categoria general ingresadas no supere
        // las disponibles
        if(valoresGenericas && valoresGenericas.length > 0){

            const isGenValid = await validCantQuestions(valoresGenericas, semestre);

            // Validamos que la cantidad de preguntas solicitadas no supere
            // las actualmente disponibles
            if(typeof isGenValid !== 'boolean'){
                return res.status(400).json({error: `La cantidad de preguntas solicitadas del ${semestre} semestre para la categoria ${isGenValid} supera las actualmente disponibles`});
            }

        }

        // Validamos la cantidad de preguntas por categoria especifica ingresadas no supere
        // las disponibles
        if(valoresEspecificas && valoresEspecificas.length > 0){

            const isEspValid = await validCantQuestions(valoresEspecificas, semestre);

            // Validamos que la cantidad de preguntas solicitadas no supere
            // las actualmente disponibles
            if(typeof isEspValid !== 'boolean'){
                return res.status(400).json({error: `La cantidad de preguntas solicitadas del ${semestre} semestre para la categoria ${isEspValid} supera las actualmente disponibles`});
            }

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

            // Creamos la relacion con competencia 

            for (const competencia_id of competencias) {

                await PruebaCompetencia.create({
                    prueba_id: prueba.id,
                    competencia_id
                }, {transaction: t});
                
            }

            // Creamos la relacion con categoria

            if(valoresGenericas && valoresGenericas.length > 0){

                for(const categoria_config of valoresGenericas){

                    const id_categoria = categoria_config[0];
                    const cant_preguntas_categoria = categoria_config[1];

                    await ConfiguracionCategoria.create({
                        cantidad_preguntas: categoria_config[1],
                        valor_categoria: categoria_config[2],
                        prueba_id: prueba.id,
                        categoria_id: categoria_config[0]
                    }, {transaction: t});

                    createTestQuestion(prueba.id, id_categoria, cant_preguntas_categoria, semestre, t);
                }

            }

            if(valoresEspecificas && valoresEspecificas.length > 0){

                for(const categoria_config of valoresEspecificas){

                    const id_categoria = categoria_config[0];
                    const cant_preguntas_categoria = categoria_config[1];

                    await ConfiguracionCategoria.create({
                        cantidad_preguntas: categoria_config[1],
                        valor_categoria: categoria_config[2],
                        prueba_id: prueba.id,
                        categoria_id: categoria_config[0]
                    }, {transaction: t});

                    createTestQuestion(prueba.id, id_categoria, cant_preguntas_categoria, semestre, t);
                }

            }

        });

        res.status(200).json('Prueba creada exitosamente');


    }catch(err){
        return res.status(500).json({error: `${err.message}`});
    }

};


/* --------- updatePrueba function -------------- */

const updatePrueba = async (req, res) => {

    try{

        // Obtenemos el id de la prueba a actualizar 
        const {id} = req.params;


        // Verificamos los datos de entrada
        const regexNum = /^[0-9]+$/; // Expresión regular que controla solo la admición de numeros

        if(!regexNum.test(id)){
            return res.status(400).json({error: 'id no válido'});
        }


        // Obtenemos los datos a actualizar
        const {nombre, descripcion, duracion, estado, valoresGenericas, valoresEspecificas} = req.body;


        // Validamos los datos obtenidos
        const regexData = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if(!regexData.test(nombre) || !regexNum.test(duracion)){
            return res.status(400).json({error: 'La sintaxis de los datos es incorrecta'});
        }


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
        if(valoresGenericas && valoresGenericas.length > 0){

            const dataCategoriasGenericas = validate_percentage_categories(valoresGenericas);
                
            valor_total_categorias += dataCategoriasGenericas;
            
        }

        // Validamos que los datos ingresados para las categotrias 
        // de la competencia especifica sean correctos (si aplica)
        if(valoresEspecificas && valoresEspecificas.length > 0){

            const dataCategoriasEspecificas = validate_percentage_categories(valoresEspecificas);

            valor_total_categorias += dataCategoriasEspecificas;

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

            // Actualizamos los valores de las categorias Gnericas (Si aplica)
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

    }catch(err){
        return res.status(500).json({error: `Error al actualizar la prueba: ${err.message}`});
    }

};


module.exports = {
    getPruebas,
    getPruebasId, 
    createPrueba,
    updatePrueba
}