import z from 'zod';
import validateData from '../util/validateData.js';

const errors = {

    TYPE_RES_ERROR: 'La opción de respuesta solo puede ser texto',
    REQ_RES_ERROR: 'La cantidad de opciones de respuestas requeridas no coincide',
    RES_MIN_ERROR: 'El texto de la opción de respuesta es muy corto',
    RES_MAX_ERROR: 'El texto de la opción de respuesta supera la cant. de caracteres permitida',

};

// Esquema para usuario estudiante
const QuestionSchema = z.object({

    body: z.object({

        texto_pregunta: z
        .string({
            invalid_type_error: 'La pregunta solo puede ser texto',
            required_error: 'El texto de la pregunta es requerido'
        })
        .min(10, { message: 'El texto de la pregunta es muy corta' })
        .max(350, { message: 'El texto de la pregunta supera la cant. de caracteres permitida' }),

        semestre: z
        .string({
            required_error: 'El semestre de la pregunta es requerido'
        })
        .regex(/^[1-9]|10$/).refine(value => {
            const numero = parseInt(value, 10);
            return numero >= 1 && numero <= 10;
        }, {
            message: 'El semestre debe estar entre 1 y 10',
        }),

        A: z
        .string({
            invalid_type_error: errors.TYPE_RES_ERROR,
            required_error: errors.REQ_RES_ERROR
        })
        .min(1, { message: errors.RES_MIN_ERROR })
        .max(300, { message: errors.RES_MAX_ERROR }),

        B: z
        .string({
            invalid_type_error: errors.TYPE_RES_ERROR,
            required_error: errors.REQ_RES_ERROR
        })
        .min(1, { message: errors.RES_MIN_ERROR })
        .max(300, { message: errors.RES_MAX_ERROR }),

        C: z
        .string({
            invalid_type_error: errors.TYPE_RES_ERROR,
            required_error: errors.REQ_RES_ERROR
        })
        .min(1, { message: errors.RES_MIN_ERROR })
        .max(300, { message: errors.RES_MAX_ERROR }),

        D: z
        .string({
            invalid_type_error: errors.TYPE_RES_ERROR,
            required_error: errors.REQ_RES_ERROR
        })
        .min(1, { message: errors.RES_MIN_ERROR })
        .max(300, { message: errors.RES_MAX_ERROR }),

        estado: z
        .boolean({ 
            invalid_type_error: 'El estado solo puede ser un valor booleano',
            required_error: 'El estado de la pregunta es requerido'
        }),

        respuesta: z
        .string({
            invalid_type_error: 'La respuesta solo puede ser texto',
            required_error: 'La respuesta de la pregunta es requerida'
        })
        .length(1, { message: 'El formato de la respuesta no coincide' }),

        imagen: z
        .object({
            url: z.string().url(),
            public_id: z.string()
        }),
        
        categoria_id: z
        .string({
            required_error: 'El identificador de la categoria es requerido'
        })
        .regex(/^\d+$/, { message: 'El identificador de la categoria solo puede ser un numero' }).refine(value => {
            const numero = parseInt(value, 10);
            return numero > 0;
        }, {
            message: 'El identificador de la categoria no debe ser 0 o negativo',
        })

    }).partial(),

    params: z.object({

       id: z
       .string({
            required_error: 'El identificador de la pregunta es necesario'
       }).regex(/^[0-9]+$/, 'Req no válido')

    }).partial(),

    query: z.object({

        estado: z
        .string({ 
            required_error: 'El estado de la pregunta es requerido'
        }).regex(/^(0|1)$/, "El formato de la query no coinicde")

    }).partial()


}).partial();


// Validación de esquema

export function validateQuestionData(req, res, next){
    const errors = validateData(QuestionSchema, req);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}


