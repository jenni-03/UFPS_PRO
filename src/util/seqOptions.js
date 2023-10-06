
function validateSeqOptions(options) {

    for (let index = 0; index < options.length - 1; index++) {

        const actual_letter = options[index];
        const next_letter = options[index + 1];
        const expected_letter = String.fromCharCode(actual_letter.charCodeAt(0) + 1);

        if (next_letter !== expected_letter) return false;
        
    }

    return true;

}

export default validateSeqOptions;