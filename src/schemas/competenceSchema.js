import z from 'zod';
import validateData from '../util/validateData.js';

//Esquema para una competencia
export const competenceSchema = z.object({

    body: z.object({

        nombre: z
            .string({
                invalid_type_error: 'El nombre de la competencia solo puede ser texto',
                required_error: 'El nombre de la competencia es requerido'
            })
            .min(3, { message: 'El nombre de la competencia es muy corto' })
            .max(45, { message: 'El nombre de la competencia supera la cant. de caracteres permitidos' }),

        descripcion: z
            .string({
                invalid_type_error: 'La descripcion de la competencia solo puede ser texto',
                required_error: 'La descripcion de la competencia es requerida'
            })
            .min(10, { message: 'La descripcion de la competencia es muy corta' })
            .max(240, { message: 'La descripcion de la competencia supera la cant. de caracteres permitidos' }),

        estado: z
            .boolean({ 
                invalid_type_error: 'El estado solo puede ser un valor booleano',
                required_error: 'El estado es requerido'
            })
            
    }).partial(),

    params: z.object({
        
        id: z
            .string({
                required_error: 'El identificador es necesario'
            }).regex(/^[0-9]+$/, 'Req no válido')

    }).partial(),

    query: z.object({

        estado: z
            .string({ 
                invalid_type_error: 'El estado solo puede ser un valor textual',
                required_error: 'El estado es requerido'
            }).regex(/^(0|1)$/, "El formato de la query no coincide")

    }).partial()


}).partial();


// Validación de esquema competencia

export function validateCompetenceData(req, res, next){
    const errors = validateData(competenceSchema, req);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}