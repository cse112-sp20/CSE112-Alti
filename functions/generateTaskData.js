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
    // These need to be formatted as dd and mm, so if it is less than
    // 10, prepend a 0.
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
async function generateCodingChallenge(codingLanguage='english',time = 1)
{
  exercises = [];
  url  = `http://www.speedcoder.net/lessons/`;
  if (codingLanguage === 'english')
  {
    if (time <=2 )
    {
      url = 'https://www.typing.com/student/typing-test/1-minute';
    }
    else if (time <= 3)
    {
      url = 'https://www.typing.com/student/typing-test/3-minute';
    }
    else
    {
      url = 'https://www.typing.com/student/typing-test/5-minute';
    }
    return Promise.resolve(url);
  }
  else if (codingLanguage === 'python')
  {
    if (time <= 2)
    {
      exercises.push(1,2,3,4,5,6,10,12,13);
    }
    else
    {
      exercises.push(7,8,9,14);
    }
    url = url + 'py';

  }
  else if (codingLanguage === 'javascript')
  {
    if (time <= 2)
    {
      exercises.push(2,3);
    }
    else
    {
      exercises.push(4,5);
    }
    url = url + 'js';
  }
  else if (codingLanguage === 'c++')
  {
    if (time <=2)
    {
      exercises.push(1,2,3);
    }
    else
    {
      exercises.push(3,4);
    }
    url = url + 'cpp';
  }
  else if (codingLanguage === 'java')
  {
    if (time <= 2)
    {
      exercises.push(1,2,3,4,5,7);
    }
    else
    {
      exercises.push(6,8,9,10);
    }
    url = url + 'java';
  }
  else
  {
    if(time <= 2)
    {
      exercises.push(1,2,3);
    }
    else
    {
      exercises.push(4,5);
    }
    url = url + 'c';
  }

  rand = exercises[Math.floor(Math.random()*exercises.length)];
  url = url + '/' + rand + '/';
  return Promise.resolve(url);
}
