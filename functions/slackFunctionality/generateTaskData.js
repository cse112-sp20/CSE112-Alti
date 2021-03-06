const index = require('./index');
const app = index.getBolt();
const quotes = require('../util/quotes');
const retros = require('../util/retros');
const motivationalQuotes = quotes.getQuotesObj();
const retroQuestions = retros.getRetrosObj();

app.command('/generatequote', async({command, ack, say}) => {
    ack();
    const quoteGenerated = exports.generateQuote();
    say(quoteGenerated);
});

app.command('/generatepuzzle', async({command, ack, say}) => {
    ack();
    const typeOfPuzzle = command.text;
    const puzzleGenerated = generatePuzzle(typeOfPuzzle);
    say('Generated a puzzle of type ' + command.text + ': ' + puzzleGenerated);
});

app.command('/generatetyping', async({command, ack, say}) => {
    ack();
    const codingLanguage = command.text;
    const codingChallengeGenerated = generateCodingChallenge(codingLanguage);
    say('Generated a code typing challenge in the language ' + command.text + ': '  + codingChallengeGenerated);
});

// Generates a quote object
exports.generateQuote = function() {
	let quotePoolSize =  Object.keys(motivationalQuotes).length;
	let randomQuoteIndex = Math.floor(Math.random() * quotePoolSize);
	let quoteText = motivationalQuotes[randomQuoteIndex].text;
	let quoteAuthor =  motivationalQuotes[randomQuoteIndex].author;
	if (quoteAuthor === null) {
		quoteAuthor = "Unknown";
	}
    return randomQuoteIndex+"-"+quoteText+" - "+ quoteAuthor ;
}

// Generates a retro object
exports.generateRetro = function() {
	let retroPoolSize =  Object.keys(retroQuestions).length;
	let randomRetroIndex = Math.floor(Math.random() * retroPoolSize);
	let retroText = retroQuestions[randomRetroIndex].retro;
    return randomRetroIndex+"-"+retroText;
}


// TODO
exports.generatePuzzle =function generatePuzzle(typeOfPuzzle) {
    // Hardcoded difficulty, can be changed but also need to
    // hardcode the upper limit for each game in that case
    const difficulty = "1";

    // Hardcode the start of the url
    var url = `https://brainbashers.com/show${typeOfPuzzle}.asp?`;

    // Append the query parameters based on the type of game
    switch(typeOfPuzzle){
        case "sudoku":
            //For consideration:
            //var difficulty = Math.floor(Math.random() * 5) + 1 
            //difficulty = difficulty.toString();
            url += generateSudokuParameters(difficulty);
            break;
        case "3inarow":
            //For consideration:
            //var difficulty = Math.floor(Math.random() * 2) + 1 
            //difficulty = difficulty.toString();
            url += generate3inarowParameters(difficulty);
            break;
        case "calcudoku":
            //For consideration:
            //var difficulty = Math.floor(Math.random() * 3) + 1 
            //difficulty = difficulty.toString();
            url += generateCalcudokuParameters(difficulty);
            break;
        case "hitori":
            //For consideration:
            //var difficulty = Math.floor(Math.random() * 3) + 1 
            //difficulty = difficulty.toString();

            url += generateHitoriParameters(difficulty);
            break;
        default:
            throw new Error('Parameter does not match any available games');
    }
    // Return the url
    return url;

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


exports.generateCodingChallenge = function generateCodingChallenge(codingLanguage,time=1)
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
    return url;
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
  else if(codingLanguage === 'c')
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
  else
  {
    throw new Exception("Coding language does not match availeble ones");
  }

  rand = exercises[Math.floor(Math.random()*exercises.length)];
  url = url + '/' + rand + '/';
  return url;
}

// Generates a message to store in Firebase and send at a later time,
// given that the user has chosen an exercise type (and secondary type if needed)
// PARAMS:
// exerciseType: type of exercise (puzzle, typing, quote)
// arg: arg passed when calling a generateABC() function
//      ie. if exerciseType is puzzle, arg could be: sudoku, calcdoku, etc.
//          if exerciseType is quote, then arg could be an empty string
exports.generateMessageToSend = function generateMessageToSend(exerciseType, arg) {
  var url = "";     // generated url (for exerciseTypes: puzzle, typing)
  var message = ""; // full message to store
  var msg = "";  	//temporary msg to store
  switch(exerciseType) {
    case "puzzle":

      url = exports.generatePuzzle(arg);
      message = "Your partner sent you this " + arg +
                " puzzle to help you get those brain juices flowing!\nComplete it here: " + url;
      break;
	  case "retro":
		  var index = arg; 
		  message = "Your partner sent you this retro: '" + retroQuestions[index].retro +
                "' to complete";
	    break;
	  case "video":
		  msg = arg; 
		  message = "Your partner sent you this video to watch! : " + msg;
	    break;
	  case "cooldownArticle":
		  msg = arg;
		  message = "Your partner sent you a non-tech article to read! Here is the link: " + arg;
	    break;

    case "typing":
      url = exports.generateCodingChallenge(arg);
      message = "Your partner sent you this cool speed coding challenge in " + arg +
                " to get your mind and fingers ready for the day!\nComplete it here: " + url;
      break;

    case "quote":
      var author = arg[0]; // generated quote and its author
      var quote = arg[1]; 
      if(author === 'Unknown'){
        message = `Your partner sent you a motivational quote to help you start your day right! ${quote}`;
      }
      else{
        message = `Your partner sent you a motivational quote to help you start your day right! ${author} says: ${quote}`;
      }
      break;
	 
	  case "article":
		  url = arg;
		  message = "Your partner sent you a tech article to read! Here is the link: " + arg;
	  break; 
	
    default:
      throw new Exception('Exercise Type did not match any of the provided types.');
  }

  return message;
}
