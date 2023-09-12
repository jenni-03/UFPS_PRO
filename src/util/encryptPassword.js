const bcrypt = require('bcrypt');

// Función encargada de la encriptación de una contraseña
const encrypt = async (password) => {

    // Generamos el numero de rondas de cifrado
    const getSalt = await bcrypt.genSalt(11);

    // Retornamos una promesa con la contraseña hasheada
    return bcrypt.hash(password, getSalt);

};

module.exports = encrypt;