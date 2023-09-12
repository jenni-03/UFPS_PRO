const {format} = require('date-fns');
const {v4: uuid} = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');


// Función encargada de crear la estructura e insertar el log requerido

const logEvents = async (message, logFileName) => {

    // Definimos el formato de la fecha 
    const dateTime = `${format(new Date(), 'yyyMMdd\tHH:mm:ss')}`;

    // Definimos la composición de los logs
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    // Verificamos la existencia del directorio y escribimos el log en el archivo especificado
    try{

        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);

    }catch (e) {
        console.error(e);
    }

};


// Middleware encargado de tomar la información requerida de la solicitud a disposición del logger

const logger = (req, res, next) => {

    // logEvents(`${req.method}\t${req.url}\t${req.header.origin}`, 'reqLog.log');

    console.log(`${req.method} ${req.path}`);

    next();

};


module.exports = {
    logEvents,
    logger
}