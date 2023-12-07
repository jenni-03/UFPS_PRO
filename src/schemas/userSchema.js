import z from 'zod';
import validateData from '../util/validateData.js';

// Esquema para usuario director
export const directorSchema = z.object({

    nombre: z
        .string({
            invalid_type_error: 'El nombre solo puede ser texto',
            required_error: 'El nombre de pila es requerido'
        })
        .min(3, { message: 'El nombre es muy corto' })
        .max(45, { message: 'El nombre supera la cant. de caracteres permitida' }),

    apellido: z
        .string({
            invalid_type_error: 'El apellido solo puede ser texto',
            required_error: 'El apellido es requerido'
        })
        .min(3, { message: 'El apellido es muy corto' })
        .max(55, { message: 'El apellido supera la cant. de caracteres permitida' }),
    
    codigo: z
        .string({
            invalid_type_error: 'El codigo solo puede ser texto',
            required_error: 'El codigo es requerido'
        })
        .length(7, { message: 'El codigo solo puede contener 7 digitos' })
        .refine((value) => /^[0-9]+$/.test(value), { message: 'El codigo debe contener solo números' }),

    email: z
        .string({
            invalid_type_error: 'El email solo puede ser texto',
            required_error: 'El email es requerido'
        })
        .email({ message: 'El formato del email es incorrecto' })
        .regex(/ufps.edu.co$/, 'El email proporcionado no corresponde a la UFPS'),
    
    password: z
        .string({
            invalid_type_error: 'La contrasenia solo puede ser texto',
            required_error: 'La contrasenia es requerida'
        })
        .min(10, { message: 'La contrasenia es muy corta' })
        .max(25, { message: 'La contrasenia excede la cant. maxima de caracteres' }),

    tipo: z
        .string({
            invalid_type_error: 'El tipo de usuario solo puede ser texto',
            required_error: 'El tipo de usuario es requerido'
        })
        .refine((value) => value === 'Director', { message: 'El tipo de usuario debe corresponder a Director' }),

    telefono: z
        .string({
            invalid_type_error: 'El telefono solo puede ser texto',
            required_error: 'El telefono del usuario es requerido'
        })
        .length(7, { message: 'El telefono solo puede contener 7 digitos' })
        .refine((value) => /^[0-9]+$/.test(value), { message: 'El telefono debe contener solo números' }),

    direccion: z
        .string({
            invalid_type_error: 'La direccion solo puede ser texto',
            required_error: 'La direccion del usuario es requerido'
        })
        .min(20, { message: 'La direccion es muy corta' })
        .max(60, { message: 'La direccion excede la cant. maxima de caracteres' }),

    documento: z
        .string({
            invalid_type_error: 'El documento solo puede ser texto',
            required_error: 'El documento del usuario es requerido'
        })
        .length(10, { message: 'El documento solo puede tener 10 digitos' })
        .refine((value) => /^[0-9]+$/.test(value), { message: 'El documento debe contener solo números' }),

    celular: z
        .string({
            invalid_type_error: 'El celular solo puede ser texto',
            required_error: 'El celular del usuario es requerido'
        })
        .length(10, { message: 'El celular solo puede tener 10 digitos' })
        .refine((value) => /^[0-9]+$/.test(value), { message: 'El celular debe contener solo números' }),
    
    rol_id: z
        .number({
            invalid_type_error: 'El identicador del rol debe ser un numero',
            required_error: 'El identificador del rol es requerido'
        }).min(1, { message: 'El identificador del rol no debe ser 0 o negativo' }),

    foto_perfil: z
        .object({
            url: z.string().url(),
            public_id: z.string()
        })
    

}).partial();


// Esquema para usuario estudiante
const studentSchema = z.object({

    body: z.object({

        nombre: z
        .string({
            invalid_type_error: 'El nombre del estudiante solo puede ser texto',
            required_error: 'El nombre del estudiante es requerido'
        })
        .min(2, { message: 'El nombre del estudiante es muy corto' })
        .max(50, { message: 'El nombre del estudiante supera la cant. de caracteres permitida' }),

        apellido: z
        .string({
            invalid_type_error: 'El apellido del estudiante solo puede ser texto',
            required_error: 'El apellido del estudiante es requerido'
        })
        .min(2, { message: 'El apellido del estudiante  es muy corto' })
        .max(55, { message: 'El apellido del estudiante supera la cant. de caracteres permitida' }),

        codigo: z
        .string({
            invalid_type_error: 'El codigo del estudiante solo puede ser texto',
            required_error: 'El codigo del estudiante es requerido'
        })
        .length(7, { message: 'El codigo del estudiante solo puede contener 7 digitos' })
        .refine((value) => /^[0-9]+$/.test(value), { message: 'El codigo del estudiante debe contener solo números' }),

        email: z
        .string({
            invalid_type_error: 'El email del estudiante  solo puede ser texto',
            required_error: 'El email del estudiante es requerido'
        })
        .email({ message: 'El formato del email es incorrecto' })
        .regex(/ufps.edu.co$/, 'El email proporcionado no corresponde a la UFPS'),

        password: z
        .string({
            invalid_type_error: 'La contraseña solo puede ser texto',
            required_error: 'La contraseña es requerida'
        })
        .min(10, { message: 'La contraseña es muy corta' })
        .max(25, { message: 'La contraseña excede la cant. maxima de caracteres' }),

        tipo: z
        .string({
            invalid_type_error: 'El tipo de usuario solo puede ser texto',
            required_error: 'El tipo de usuario es requerido'
        })
        .refine((value) => value === 'Estudiante', { message: 'El tipo de usuario debe corresponder a Estudiante' }),

        semestre: z
        .number({
            invalid_type_error: 'El semestre del estudiante debe ser un numero',
            required_error: 'El semestre del estudiante es requerido'
        })
        .min(1, { message: 'El semestre del estudiante no debe ser 0 o negativo' })
        .max(10, { message: 'El semestre del estudiante no debe ser mayor a 10' }),

        rol_id: z
        .number({
            invalid_type_error: 'El identicador del rol debe ser un numero',
            required_error: 'El identificador del rol es requerido'
        })
        .min(1, { message: 'El identificador del rol no debe ser 0 o negativo' })

    }).partial(),

    params: z.object({

       id: z
       .string({
            required_error: 'El identificador del usuario es necesario'
       }).regex(/^[0-9]+$/, 'Req no válido')

    }).partial(),

    query: z.object({

        estado: z
        .string({ 
            required_error: 'El estado del usuario es requerido'
        }).regex(/^(0|1)$/, "El formato de la query no coinicde")

    }).partial()


}).partial();


// Esquema de inicio de sesión
const loginSchema = z.object({

    email: z.string({
        invalid_type_error: 'El email solo puede ser texto'
    }).email({ message: 'El formato del email es incorrecto' }).regex(/ufps.edu.co$/, 'El email proporcionado no corresponde a la UFPS'),
    password: z.string({
        invalid_type_error: 'La contraseña solo puede ser texto'
    }).regex(new RegExp(/^(?!select|update|delete)/i), 'Formato de password no valido')

}).strict();


// Esquema para solicitud de cambio de contraseña
const reqPassResetSchema = z.object({

    email: z.string({
        invalid_type_error: 'El email solo puede ser texto'
    }).email({ message: 'El formato del email es incorrecto' }).regex(/ufps.edu.co$/, 'El email proporcionado no corresponde a la UFPS'),
    redirectURL: z.string({
        invalid_type_error: 'La URL solo puede ser texto'
    }).url({ message: 'El formato de URL no corresponde' })

}).strict();


// Validación de esquemas

export function validateReqPassReset(req, res, next){
    const errors = validateData(reqPassResetSchema, req.body);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}

export function validateLoginData(req, res, next) {
    const errors = validateData(loginSchema, req.body);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}

export function validateStudentData(req, res, next){
    const errors = validateData(studentSchema, req);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}

export function validateDirectorData(req, res, next){
    const errors = validateData(directorSchema, req.body);
    if (errors.length !== 0) return res.status(400).json({ error: errors });
    next();
}


