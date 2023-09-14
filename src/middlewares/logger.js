import dayjs from 'dayjs';
import pino from 'pino';


// Configuración logger pino
const logger = pino({
    transport: {
        target: 'pino-pretty'
    },
    base: {
        pid: false
    },
    timestamp: () => `,"time":"${dayjs().format('DD/MM/YYYY HH:mm')}"`
});

export default logger;