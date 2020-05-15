const index = require('./index');
const { app, token } = index.getBolt();
const quotes = require('./quotes');
const motivationalQuotes = quotes.getQuotesObj();

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
	let quotePoolSize =  Object.keys(motivationalQuotes).length;
	let randomQuoteIndex = Math.floor(Math.random() * quotePoolSize);
	let quoteText = motivationalQuotes[randomQuoteIndex].text; 
	let quoteAuthor =  motivationalQuotes[randomQuoteIndex].author;
	if (quoteAuthor === null) {
		quoteAuthor = "Unknown";
	}
    return Promise.resolve(quoteText+" - " + quoteAuthor);
}

// TODO
async function generatePuzzle(typeOfPuzzle) {
    return Promise.resolve("");
}

// TODO
async function generateCodingChallenge(codingLanguage) {
    return Promise.resolve("");
}