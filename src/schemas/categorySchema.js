import z from 'zod';
import validateData from '../util/validateData.js';

// Esquema para categoria
const categorySchema = z.object({

    body: z.object({

        nombre: z
            .string({
                invalid_type_error: 'El nombre de la categoria solo puede ser texto',
                required_error: 'El nombre de la categoria es requerido'
            })
            .min(3, { message: 'El nombre de la categoria es muy corto' })
            .max(45, { message: 'El nombre de la categoria supera la cant. de caracteres permitida' }),

        descripcion: z
            .string({
                invalid_type_error: 'La descripción solo puede ser texto',
                required_error: 'La descripción de la categoria es requerida'
            })
            .min(10, { message: 'La descripción de la categoria es muy corta' })
            .max(240, { message: 'La descripción de la categoria supera la cant. de caracteres permitida' }),
        
        estado: z
            .boolean({ 
                invalid_type_error: 'El estado de la categoria solo puede ser un valor booleano',
                required_error: 'El estado de la categoria es requerido'
            }),
        
        competencia_id: z
            .number({
                invalid_type_error: 'El id de la competencia debe ser numerico',
                required_error: 'El identificador de la competencia asociada es necesario'
            })
        

    }).partial(),
    

    params: z.object({

        id: z
            .string({
                required_error: 'El identificador de la categoria es necesario'
            }).regex(/^[0-9]+$/, 'Req no válido')
 
    }).partial(),
 

    query: z.object({
 
        estado: z
            .string({ 
                required_error: 'El estado de la categoria es requerido'
            }).regex(/^(0|1)$/, "El formato de la query no coinicde")
 
    }).partial()
    

}).partial();


// Validación de esquema

export function validateCategoryData(req, res, next){
    const errors = validateData(categorySchema, req);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}