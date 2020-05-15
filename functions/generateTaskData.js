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
    // return Promise.resolve("");
    var url = `https://brainbashers.com/show${typeOfPuzzle}.asp?` ;
    date = new Date();
    var day = String(date.getDate());
    if (day < 10){
        day = "0" + day;
    }
    var month = String(date.getMonth() + 1); //As January is 0.
    if (month < 10){
        month = "0" + month;
    }
    const year = String(date.getFullYear());
    if(typeOfPuzzle === "sudoku"){
        url += generateSudokuParameters(year, month, day);
    }
    if(typeOfPuzzle === "3inarow"){
        url += generate3inarowParameters();
    }
    if(typeOfPuzzle === "calcudoku"){
        url += generateCalcudokuParameters();
    }
    return Promise.resolve(url);

}
function generate3inarowParameters(){
    const diff = "1";
    const date = "RAND";
    const size = "6";
    return `date=${date}&diff=${diff}&size=${size}`;
}
function generateSudokuParameters(year, month, day){
    const date = String(year) + String(month) + String(day);
    const diff = "1";
    return `date=${date}&diff=${diff}`;
}
function generateCalcudokuParameters(){
    const diff = "1";
    const date = "RAND";
    const size = "4";
    return `date=${date}&diff=${diff}&size=${size}`;
}
// TODO
async function generateCodingChallenge(codingLanguage) {
    return Promise.resolve("");
}