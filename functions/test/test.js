'use strict'
const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;
const index = require('../slackFunctionality/index');
const testUtil = require('./testUtil');
const app = index.getBolt();

var generateTaskData = require ('../slackFunctionality/generateTaskData');
const quotes = require('../util/quotes');
const retros = require('../util/retros');
const motivationalQuotes = quotes.getQuotesObj();
const retroQuestions = retros.getRetrosObj();

let firestoreFuncs = require('../util/firestore');

const functions = require('firebase-functions');
const config = functions.config();
let token = config.slack.bot_token;
// Unit Tests  go Here
describe('Unit Testing', () => {
  describe('util', () => {
    describe('Test getChannelIdByName', () => {
      // helps to find the channel ids
      let util;
      before(async () => {
        util = require('../util/util');
      });
      
      it('Test with channel general', async function() {
        this.timeout(5000); // 5 sec
        var channelId = await util.getChannelIdByName(app, token, "general");
        assert.equal(channelId, "C012WGXPYC9"); //hardcoded it with console.log
      });

      it('Test with channel alti-paring', async function() {
        this.timeout(5000); // 5 sec
        var channelId = await util.getChannelIdByName(app, token, "alti-pairing");
        assert.equal(channelId, "C01391DPZV4"); //hardcoded it with console.log
      });

      it('Test with channel that doesnt exist', async function () {
        this.timeout(5000); // 5 sec
        var channelId = await util.getChannelIdByName(app, token, "should not exist");
        assert.equal(channelId, undefined); 
      });
    });  
  });

  describe('generateCodingChallenge', () => {
    var url;

    it('Testing english', () => {
      //generateCodingChallenge();
      url = generateTaskData.generateCodingChallenge('english');
      assert.equal(url,'https://www.typing.com/student/typing-test/1-minute');

      url = generateTaskData.generateCodingChallenge('english',3);
      assert.equal(url,'https://www.typing.com/student/typing-test/3-minute');

      url = generateTaskData.generateCodingChallenge('english',10);
      assert.equal(url,'https://www.typing.com/student/typing-test/5-minute');
    });

    it('Testing python', () => {
      url = generateTaskData.generateCodingChallenge('python',5);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/py/');
      assert((url.substring(37, 38) <= '9' && url.substring(37,38) >='7') || (url.substring(37,38) === '14'));
      
      url = generateTaskData.generateCodingChallenge('python',1);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/py/');
      //checking if difficulty in correct range
      assert((url.substring(37, 38) <= '6') || (url.substring(37,38) === '14') || (url.substring(37,38) === '12') ||(url.substring(37,38) === '13'));
      
    });

    it('Testing javascript', () => {
      url = generateTaskData.generateCodingChallenge('javascript',1);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/js/');
      assert((url.substring(37, 38) ==='2') || (url.substring(37,38) === '3'));

      //different time test so it picks a differnt set of exercises
      url = generateTaskData.generateCodingChallenge('javascript',3);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/js/');
      assert((url.substring(37, 38) ==='4') || (url.substring(37,38) === '5'));

    });

    it('Testing java', () => {
      url = generateTaskData.generateCodingChallenge('java',2);
      assert.equal(url.substring(0, 38),'http://www.speedcoder.net/lessons/java');
      assert((url.substring(38, 39) ==='7') || (url.substring(38, 39) <= '5'));

      //different time test so it picks a differnt set of exercises
      url = generateTaskData.generateCodingChallenge('java',5);
      assert.equal(url.substring(0, 38),'http://www.speedcoder.net/lessons/java');
      assert((url.substring(39, 40) <= '10' && url.substring(39, 40) >='8') || (url.substring(39, 40) === '6'));
  
    });

    it('Testing c', () => {
      url = generateTaskData.generateCodingChallenge('c',3);
      assert.equal(url.substring(0, 35),'http://www.speedcoder.net/lessons/c');
      assert((url.substring(36, 37) ==='4') || (url.substring(36, 37) === '5'));

      url = generateTaskData.generateCodingChallenge('c',1);
      assert.equal(url.substring(0, 35),'http://www.speedcoder.net/lessons/c');
      assert((url.substring(36, 37) <= '3'));

    });

    it('Testing c++', () => {
      url = generateTaskData.generateCodingChallenge('c++',5);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/cpp');
      assert((url.substring(38, 39) ==='3') || (url.substring(38, 39) === '4'));

      url = generateTaskData.generateCodingChallenge('c++',2);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/cpp');
      assert((url.substring(38, 39) <= '3'));

    });

  });
  
  describe('generatePuzzle', () => {
    var url;
    it('Testing sudoku', () => {
      //generatePuzzle();
      url = generateTaskData.generatePuzzle('sudoku');
      assert.equal(url.substring(0,35),'https://brainbashers.com/showsudoku');
    });

    it('Testing 3 in a row', () => {
      url = generateTaskData.generatePuzzle('3inarow');
      assert.equal(url.substring(0,36),'https://brainbashers.com/show3inarow');
    });

    it('Testing calcudoku', () => {
      url = generateTaskData.generatePuzzle('calcudoku');
      assert.equal(url.substring(0, 38),'https://brainbashers.com/showcalcudoku');
    });

    it('Testing hitori', () => {
      url = generateTaskData.generatePuzzle('hitori');
      assert.equal(url.substring(0, 35),'https://brainbashers.com/showhitori');
    });
    it('Testing Exception', () =>{
      assert.throws( function() {  generateTaskData.generatePuzzle('neighbors'); }, Error );
    });
  });

  describe('generateMessageToSend', () => {
    var msg;
    var expectedString;
    it('Testing puzzle messages', () => {
        msg = generateTaskData.generateMessageToSend('puzzle', 'sudoku');
        expectedString = "Your partner sent you this sudoku puzzle to help you get those brain juices flowing!\n"
        assert.equal(msg.substring(0, 85), expectedString);

        msg = generateTaskData.generateMessageToSend('puzzle', '3inarow');
        expectedString = "Your partner sent you this 3inarow puzzle to help you get those brain juices flowing!\n"
        assert.equal(msg.substring(0, 86), expectedString);

        msg = generateTaskData.generateMessageToSend('puzzle', 'calcudoku');
        expectedString = "Your partner sent you this calcudoku puzzle to help you get those brain juices flowing!\n"
        assert.equal(msg.substring(0, 88), expectedString);

        msg = generateTaskData.generateMessageToSend('puzzle', 'hitori');
        expectedString = "Your partner sent you this hitori puzzle to help you get those brain juices flowing!\n"
        assert.equal(msg.substring(0, 85), expectedString);
    
    });

    it('Testing retro message', () => {
      msg = generateTaskData.generateMessageToSend('retro', 0)
      expectedString = "Your partner sent you this retro:"
      assert.equal(msg.substring(0, 33), expectedString);
    });

    it('Testing video message', () => {
      msg = generateTaskData.generateMessageToSend('video', "youtube.com")
      expectedString= "Your partner sent you this video to watch! : youtube.com"
      assert.equal(msg, expectedString);
    });

    it('Testing cooldownArticle message', () => {
      msg = generateTaskData.generateMessageToSend('cooldownArticle', "fivethirtyeight.com")
      expectedString= "Your partner sent you a non-tech article to read! Here is the link: fivethirtyeight.com"
      assert.equal(msg, expectedString);
    });

    it('Testing typing message', () => {
      msg = generateTaskData.generateMessageToSend('typing', "english");
      expectedString = "Your partner sent you this cool speed coding challenge in english to get your mind and fingers ready for the day!\n"
      assert.equal(msg.substring(0, 114), expectedString);
      
      msg = generateTaskData.generateMessageToSend('typing', "python");
      expectedString = "Your partner sent you this cool speed coding challenge in python to get your mind and fingers ready for the day!\n"
      assert.equal(msg.substring(0, 113), expectedString);

      msg = generateTaskData.generateMessageToSend('typing', "javascript");
      expectedString = "Your partner sent you this cool speed coding challenge in javascript to get your mind and fingers ready for the day!\n"
      assert.equal(msg.substring(0, 117), expectedString);

      msg = generateTaskData.generateMessageToSend('typing', "java");
      expectedString = "Your partner sent you this cool speed coding challenge in java to get your mind and fingers ready for the day!\n"
      assert.equal(msg.substring(0, 111), expectedString);

      msg = generateTaskData.generateMessageToSend('typing', "c");
      expectedString = "Your partner sent you this cool speed coding challenge in c to get your mind and fingers ready for the day!\n"
      assert.equal(msg.substring(0, 108), expectedString);

      msg = generateTaskData.generateMessageToSend('typing', "c++");
      expectedString = "Your partner sent you this cool speed coding challenge in c++ to get your mind and fingers ready for the day!\n"
      assert.equal(msg.substring(0, 110), expectedString);
    });

    it('Testing quote message', () => {
      var quoteInfo = ["MLK", "A riot is the language of the unheard."]
      msg = generateTaskData.generateMessageToSend('quote', quoteInfo);
      expectedString= "Your partner sent you a motivational quote to help you start your day right! MLK says: A riot is the language of the unheard."
      assert.equal(msg, expectedString);

      quoteInfo = ["Unknown", "Water and words, easy to pour, impossible to recover."]
      msg = generateTaskData.generateMessageToSend('quote', quoteInfo);
      expectedString= "Your partner sent you a motivational quote to help you start your day right! Water and words, easy to pour, impossible to recover."
      assert.equal(msg, expectedString);
    });

    it('Testing article message', () => {
      msg = generateTaskData.generateMessageToSend('article', "theverge.com");
      expectedString= "Your partner sent you a tech article to read! Here is the link: theverge.com"
      assert.equal(msg, expectedString);
    });

  });


  

  //tests random generation features
  describe('Testing Random Generation', () => {
    var numTests = 20;
    it('Testing Quote Generation', () => {
      //generate multiple quotes
      for (let testIterator = 0; testIterator < numTests; testIterator++) {
        let testQuote = generateTaskData.generateQuote();
        let quoteArray = testQuote.split("-");
        let testArray = quoteArray[1].split(" ");
        let testString = testArray[0];
        let targetQuote = motivationalQuotes[quoteArray[0]].text;
        let targetArray = targetQuote.split(/[ -]+/);
        let targetString = targetArray[0];
        assert.equal(testString,targetString);
      }
    });
    it('Testing Retro Generation', () => {
        for (let testIterator = 0; testIterator < numTests; testIterator++) {
        let testRetro = generateTaskData.generateRetro();
        let retroArray = testRetro.split("-");
        let testArray = retroArray[1].split(" ");
        let testString = testArray[0];
        let targetRetro = retroQuestions[retroArray[0]].retro;
        let targetArray = targetRetro.split(/[ -]+/);
        let targetString = targetArray[0];
        assert.equal(testString,targetString);
      }
    });
  });

  describe('onBoard Test', () => {
    let onBoard;
    let util;
    let team_id = 'T0137P851BJ';
    
    before(async function() {
      this.timeout(5000); // 5sec
      onBoard = require('../slackFunctionality/onBoard');
      util = require('../util/util')
    });

    it('Test getUsersWorkspace', async function() {
      this.timeout(5000);
      let users = { 
        'U01236C905V': 'alermi',
        'U012HPHS2FR': 'dfritsch',
        'U012P9C053Q': 'jnjohnso',
        'U012RQ0TQG6': 'ajz007',
        'U012X3JJS78': 'sssaiya',
        'U012YEB5HR8': 'j2leigh',
        'U012YGB2M50': 'rrshenoy',
        'U012YNT21C3': 'hili',
        'U0132DWLTT7': 'lumamoto',
        'U0133SAJ0E7': 'yid118',
        'U01341THLV9': 'bvanzant',
        'U01341VGSE7': 'tlimperi',
        'U0134PZ89UL': 'e4wei',
        'U013G97PNFK': 'rusong' 
      };
      let onBoardUsers = await onBoard.onBoardFindUsersWorkspace(app, token);
      assert.deepEqual(users, onBoardUsers);
    });

    it('Test getUsersChannel on testing', async function() {
      this.timeout(5000);
      let channelId = "C012B6BTVDL"; // testing channel
      let users = [
        'U01236C905V',
        'U012HPHS2FR',
        'U012P9C053Q',
        'U012RQ0TQG6',
        'U012X3JJS78',
        'U012YEB5HR8',
        'U012YGB2M50',
        'U012YNT21C3',
        'U0132DWLTT7',
        'U0133SAJ0E7',
        'U01341THLV9',
        'U01341VGSE7',
        'U0134PZ89UL',
        'U013G97PNFK',
        'U0138LYQM4Z'
      ];
      let onBoardUsers = await onBoard.onBoardFindUsersChannel(app, token, channelId);
      assert.deepEqual(new Set(users), new Set(onBoardUsers));
      
    });

    it('Test getUsersChannel on testingother', async function() {
      this.timeout(5000);
      let channelId = "C013REGN18F"; // testingother channel
      let users = [
        'U012YGB2M50',
        'U0133SAJ0E7'
      ];
      let onBoardUsers = await onBoard.onBoardFindUsersChannel(app, token, channelId);
      assert.deepEqual(new Set(users), new Set(onBoardUsers));
    });
  });
});

// This functions assumes that the HandleQuoteSelect function
// only sets warmups. Needs to be changed when cooldowns are added
// Does not test the generated url. Only checks the prompt stored in the firestore 
describe('Setup Warmup Callbacks', () => {
  let workspaceInfo;
  let workspaceId;
  let ackCalled;
  var fakeContext;
  var pair;
  // UserId1 is the one choosing the exercise,
  // UserId2 is the one being assigned the exercise
  var userId1, userId2;

  var fakeBody;
  var fakeView; 

  async function fakeAck(){
    ackCalled = true;
  }

  before(async function() {
    this.timeout(5000); //5 sec    
    fakeContext = { botToken: token};
    return testUtil.setupPairs('T0137P851BJ','C012B6BTVDL').then(response => {
      return app.client.team.info({
        token: token
      }).then( workspaceInfoReturn => {
        workspaceInfo = workspaceInfoReturn;
        workspaceId = workspaceInfo.team.id;
        return Promise.resolve(firestoreFuncs.getPairedUsers(workspaceId));
      }).then( pairsReturn => {
        var pairs = pairsReturn;    
        // Fails if there are no paired people existing in
        // the database already. needs to be fixed by initializing
        // a pre-set db at the start of the test
        var pairsExist = (pairs.length > 0);
        assert.equal(pairsExist, true);
        pair = pairs[0];
        // Fails if the paired up people is not a pair.
        // Need to be changed if we allow groups of 3.
        assert.equal(pair.users.length, 2);
        userId1 = pair.users[0];
        userId2 = pair.users[1];
        fakeBody = {
          team: {id:workspaceId},
          user: {id:userId1},
          view: {id:undefined},
          // The value needs to be set based on the type of exercise
          actions: [{values:''}]
        };

        fakeView = {
          state: {values:{input_text : {value:''} }  }
        };
        return Promise.resolve();
      });
    });
  });

  after(async() => {
    await testUtil.deleteWorkspace(workspaceId);
  })

  it('handleTypingSelect', async function() {  
    fakeBody.actions[0].value = 'java';

    let check1 = await handleTypingSelect(fakeAck, fakeBody, fakeContext);
    //console.log(check1);
    let check2 = await firestoreFuncs.getExercisePrompt(workspaceId, userId2, true);
    //console.log(check2);

    let expectedString = "Your partner sent you this cool speed coding challenge in java to get your mind and fingers ready for the day!\nComplete it here: ";
    assert.equal(check2.substring(0,expectedString.length), expectedString);
  });
    
  it('handlePuzzleSelect', async function() {
    fakeBody.actions[0].value = 'sudoku';

    let check1 = await handlePuzzleSelect(fakeAck, fakeBody, fakeContext);
    //console.log(check1);
    let check2 = await firestoreFuncs.getExercisePrompt(workspaceId, userId2, true);
    //console.log(check2);

    let expectedString = "Your partner sent you this sudoku puzzle to help you get those brain juices flowing!\nComplete it here: ";
    assert.equal(check2.substring(0,expectedString.length), expectedString);
  });

  it('handleQuoteSelect', async function() {
    let quotePoolSize =  Object.keys(motivationalQuotes).length;

    let randomQuoteIndex1 = Math.floor(Math.random() * quotePoolSize);
    fakeBody.actions[0].value = randomQuoteIndex1;
    await handleQuoteSelect(fakeAck, fakeBody, fakeContext);
    let prompt1 = await firestoreFuncs.getExercisePrompt(workspaceId, userId2, true);
    //console.log(prompt1);

    let randomQuoteIndex2 = Math.floor(Math.random() * quotePoolSize);
    fakeBody.actions[0].value = randomQuoteIndex2;
    await handleQuoteSelect(fakeAck, fakeBody, fakeContext);
    let prompt2 = await firestoreFuncs.getExercisePrompt(workspaceId, userId2, true);
    //console.log(prompt2);

    let author1 = motivationalQuotes[randomQuoteIndex1].author;
    let text1 = motivationalQuotes[randomQuoteIndex1].text;
    let actualPrompt1 = ""

    if( author1 === null || author1 === 'Unknown' )
      actualPrompt1 = `Your partner sent you a motivational quote to help you start your day right! ${text1}`;
    else
      actualPrompt1 = `Your partner sent you a motivational quote to help you start your day right! ${author1} says: ${text1}`;

    let author2 = motivationalQuotes[randomQuoteIndex2].author;
    let text2 = motivationalQuotes[randomQuoteIndex2].text;
    let actualPrompt2 = ""

    if( author2 === null || author2 === 'Unknown' )
      actualPrompt2 = `Your partner sent you a motivational quote to help you start your day right! ${text2}`;
    else
      actualPrompt2 = `Your partner sent you a motivational quote to help you start your day right! ${author2} says: ${text2}`;
    
    assert.equal(prompt1, actualPrompt1);
    assert.equal(prompt2, actualPrompt2);
  });

  it('handleRetroSelect', async function() {
    let retroPoolSize =  Object.keys(retroQuestions).length;

    let randomRetroIndex1 = Math.floor(Math.random() * retroPoolSize);
    fakeBody.actions[0].value = randomRetroIndex1;
    await handleRetroSelect(fakeAck, fakeBody, fakeContext);
    let prompt1 = await firestoreFuncs.getExercisePrompt(workspaceId, userId2, false);
    //console.log(prompt1);

    let randomRetroIndex2 = Math.floor(Math.random() * retroPoolSize);
    fakeBody.actions[0].value = randomRetroIndex2;
    await handleRetroSelect(fakeAck, fakeBody, fakeContext);
    let prompt2 = await firestoreFuncs.getExercisePrompt(workspaceId, userId2, false);
    //console.log(prompt2);

    let actualPrompt1 = "Your partner sent you this retro: '" + retroQuestions[randomRetroIndex1].retro + "' to complete";
    let actualPrompt2 = "Your partner sent you this retro: '" + retroQuestions[randomRetroIndex2].retro + "' to complete";

    assert.equal(prompt1, actualPrompt1);
    assert.equal(prompt2, actualPrompt2);
  });
});