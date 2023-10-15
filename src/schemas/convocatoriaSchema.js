import z from 'zod';
import validateData from '../util/validateData.js';

// Esquema para convocatoria
const convocatorySchema = z.object({

    body: z.object({

        nombre: z
            .string({
                invalid_type_error: 'El nombre de la convocatoria solo puede ser texto',
                required_error: 'El nombre de la convocatoria es requerido'
            })
            .min(5, { message: 'El nombre de la convocatoria es muy corto' })
            .max(65, { message: 'El nombre de la convocatoria supera la cant. de caracteres permitidos' }),

        descripcion: z
            .string({
                invalid_type_error: 'La descripción de la convocatoria solo puede ser texto',
                required_error: 'La descripción de la convocatoria es requerida'
            })
            .min(20, { message: 'La descripción de la convocatoria es muy corta' })
            .max(450, { message: 'La descripción de la convocatoria supera la cant. de caracteres permitidos' }),

        fecha_inicio: z
            .date({
                invalid_type_error: 'Por favor ingresa un formato de fecha valido',
                required_error: 'La fecha de inicio de la convocatoria es requerida'
            }),

        fecha_fin: z
            .date({
                invalid_type_error: 'Por favor ingresa un formato de fecha valido',
                required_error: 'La fecha de finalización de la convocatoria es requerida'
            }),
        
        estado: z
            .boolean({ 
                invalid_type_error: 'El estado de la convocatoria solo puede ser un valor booleano',
                required_error: 'El estado de la convocatoria es requerido'
            }),
        
        prueba_id: z
            .string({
                required_error: 'El identificador de la prueba es requerido'
            })
            .regex(/^\d+$/, { message: 'El identificador de la prueba solo puede ser un numero' }).refine(value => {
                const numero = parseInt(value, 10);
                return numero > 0;
            }, {
                message: 'El identificador de la prueba no debe ser 0 o negativo',
            })

    }).partial(),
    

    params: z.object({

        id: z
            .string({
                required_error: 'El identificador de la convocatoria es necesario'
            }).regex(/^[0-9]+$/, 'Req no válido')
        
    }).partial(),

    query: z.object({

        estado: z
            .string({ 
                required_error: 'El estado de la convocatoria es requerido'
            }).regex(/^(0|1)$/, "El formato de la query no coincide")

    }).partial()
    

}).partial();


// Validación de esquema
export function validateConvocatoriaData(req, res, next){
    const errors = validateData(convocatorySchema, req);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}