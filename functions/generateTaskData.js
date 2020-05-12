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
    const puzzleGenerated = generatePuzzle(); 
    return puzzleGenerated.then( response => {
        return Promise.resolve(say(`Generated a puzzle: ` + response));
    });
});

app.command('/generatetyping', async({command, ack, say}) => {
    ack();
    const codingChallengeGenerated = generateCodingChallenge(); 
    return codingChallengeGenerated.then( response => {
        return Promise.resolve(say(`Generated a code typing challenge: ` + response));
    });
});

// TODO
async function generateQuote() {
    return Promise.resolve("");
}

// TODO
async function generatePuzzle() {
    return Promise.resolve("");
}

// TODO
async function generateCodingChallenge() {
    return Promise.resolve("");
}