import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: 10,
    message: { error: 'Demasiadas solicitudes recibidas, intente de nuevo más tarde' },
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

export default limiter;