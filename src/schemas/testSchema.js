import z from 'zod';
import validateData from '../util/validateData.js';

// Esquema para categoria
const testSchema = z.object({

    body: z.object({

        nombre: z
            .string({
                invalid_type_error: 'El nombre de la prueba solo puede ser texto',
                required_error: 'El nombre de la prueba es requerido'
            })
            .min(10, { message: 'El nombre de la prueba es muy corto' })
            .max(55, { message: 'El nombre de la prueba supera la cant. de caracteres permitidos' }),

        descripcion: z
            .string({
                invalid_type_error: 'La descripción de la prueba solo puede ser texto',
                required_error: 'La descripción de la prueba es requerida'
            })
            .min(20, { message: 'La descripción de la prueba es muy corta' })
            .max(200, { message: 'La descripción de la prueba supera la cant. de caracteres permitidos' }),

        semestre: z
            .string({
                invalid_type_error: 'El semestre de la prueba debe ser numerico',
                required_error: 'El semestre de la prueba es necesario'
            })
            .regex(/^[1-9]|10$/).refine(value => {
                const numero = parseInt(value, 10);
                return numero >= 1 && numero <= 10;
            }, {
                message: 'El semestre debe estar entre 1 y 10',
            }),
            
        duracion: z
            .number({
                invalid_type_error: 'La duracion de la prueba debe ser un valor numerico',
                required_error: 'La duracion de la prueba es necesaria'
            })
            .min(1, { message: 'La duracion de la prueba debe ser mayor que 0' }),

        estado: z
            .boolean({ 
                invalid_type_error: 'El estado de la prueba solo puede ser un valor booleano',
                required_error: 'El estado de la prueba es requerido'
            }),

        total_preguntas: z
            .number({
                invalid_type_error: 'El total de preguntas de la prueba debe ser numerico',
                required_error: 'El total de preguntas de la prueba es necesario'
            })
            .min(1, { message: 'El total de preguntas de la prueba debe ser mayor que 0' }),
        
        puntaje_total: z
            .number({
                invalid_type_error: 'El puntaje total de la prueba debe ser numerico',
                required_error: 'El puntaje total de la prueba es necesario'
            })
            .min(1,{message: 'El puntaje total de la prueba debe ser mayor que 0'})
        

    }).partial(),
    

    params: z.object({

        id: z
            .string({
                required_error: 'El identificador de la prueba es necesario'
            }).regex(/^[0-9]+$/, 'Req no válido')
        
    }).partial(),

    query: z.object({

        estado: z
            .string({ 
                required_error: 'El estado de la prueba es requerido'
            }).regex(/^(0|1)$/, "El formato de la query no coincide"),

        semestre: z
            .string({
                required_error: 'El semestre de la prueba es requerido'
            })
            .regex(/^[1-9]|10$/).refine(value => {
                const numero = parseInt(value, 10);
                return numero >= 1 && numero <= 10;
            }, {
                message: 'El semestre debe estar entre 1 y 10',
            }),

    }).partial()
    

}).partial();


// Validación de esquema

export function validateTestData(req, res, next){
    const errors = validateData(testSchema, req);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}