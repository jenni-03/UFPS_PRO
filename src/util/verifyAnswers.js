
/**
 * Función encargada de de validar que cada una de las respuestas de una preguntas sean unicas
 * @param {object} answers 
 * @returns boolean
 */
export function validateAnswers(answers) {

    let visto = {};

    for (const answer of answers) {

        if (visto[answer]){
            return false;
        }
        visto[answer] = true;

    }

    return true;

}


/**
 * Función encargada de determinar la posición de una letra en el alfabeto
 * @param {string} letra 
 * @returns number
 */
export function posicionEnAlfabeto(letra) {

    // Convierte la letra a minúscula para manejar letras mayúsculas y minúsculas
    letra = letra.toLowerCase();
  
    // Obtén el código Unicode de la letra y réstale el código de 'a' (97) + 1
    const posicion = letra.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
  
    return posicion;
    
}


/**
 * Función encargada de remover las preguntas duplicadas de las preguntas a insertar
 * @param {object} questions 
 * @returns array with all unique answers
 */
export function removeQuestionsRepeat(questions) {

    let visto = {};
    const uniqueQuestions = [];

    for (const question of questions) {

        if (!visto[question.texto_pregunta]){
            uniqueQuestions.push(question);
        }
        visto[question.texto_pregunta] = true;

    }

    return uniqueQuestions;

}
