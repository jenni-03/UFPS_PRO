
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
