const index = require('./index');
const { app, token } = index.getBolt();

app.command('/generatequote', async({command, ack, say}) => {
    ack();
    const quoteGenerated = generateQuote(); 
    return quoteGenerated.then( response => {
        return Promise.resolve(say(`Generated a quote: ` + response));
    });
});

app.command('/generatepuzzle', async({command, ack, say}) => {
    ack();
    const typeOfPuzzle = command.text;
    const puzzleGenerated = generatePuzzle(typeOfPuzzle); 
    return puzzleGenerated.then( response => {
        return Promise.resolve(say('Generated a puzzle of type ' + command.text + ': ' + response));
    });
});

app.command('/generatetyping', async({command, ack, say}) => {
    ack();
    const codingLanguage = command.text;
    const codingChallengeGenerated = generateCodingChallenge(codingLanguage); 
    return codingChallengeGenerated.then( response => {
        return Promise.resolve(say('Generated a code typing challenge in the language ' + command.text + ': '  + response));
    });
});

// TODO
async function generateQuote() {
    return Promise.resolve("");
}

// TODO
async function generatePuzzle(typeOfPuzzle) {
    // Hardcoded difficulty, can be changed but also need to
    // hardcode the upper limit for each game in that case
    const difficulty = "1";

    // Hardcode the start of the url
    var url = `https://brainbashers.com/show${typeOfPuzzle}.asp?`;

    // Append the query parameters based on the type of game
    switch(typeOfPuzzle){
        case "sudoku":
            url += generateSudokuParameters(difficulty);
            break;
        case "3inarow":
            url += generate3inarowParameters(difficulty);
            break;
        case "calcudoku":
            url += generateCalcudokuParameters(difficulty);
            break;
        case "hitori":
            url += generateHitoriParameters(difficulty);
            break;
        default:
            throw new Error('Parameter does not match any available games');
    }
    // Return the url
    return Promise.resolve(url);

}
function generate3inarowParameters(difficulty){
    const diff = String(difficulty);
    const date = "RAND";
    const size = "6";
    return `date=${date}&diff=${diff}&size=${size}`;
}

// Generates the query parameters for sudoku
function generateSudokuParameters(difficulty){
    // Sudoku does not take in RAND value to randomize, so randomize the date
    // as a random date from this year.
    const date = new Date();
    const year = String(date.getFullYear());

    var day = (Math.floor(Math.random() * date.getDate())) + 1;
    var month = (Math.floor(Math.random() * date.getMonth())) + 1;
    if (day < 10){
        day = "0" + day;
    }
    if (month < 10){
        month = "0" + month;
    }
    const dateString = String(year) + String(month) + String(day);
    const diff = String(difficulty);
    return `date=${dateString}&diff=${diff}`;
}
// Generates the query parameters for calcudoku
function generateCalcudokuParameters(difficulty){
    const diff = String(difficulty);
    const date = "RAND";
    const size = "4";
    return `date=${date}&diff=${diff}&size=${size}`;
}
// Generates the query parameters for hitori
function generateHitoriParameters(difficulty){
    const diff = String(difficulty);
    const date = "RAND";
    const size = "5";
    return `date=${date}&diff=${diff}&size=${size}`;
}

// TODO
async function generateCodingChallenge(codingLanguage) {
    return Promise.resolve("");
}