'use strict'
const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;
const index = require('../index');
const testUtil = require('./testUtil');
const app = index.getBolt();

var generateTaskData = require ('../generateTaskData');
const quotes = require('../quotes');
const retros = require('../retros');
const motivationalQuotes = quotes.getQuotesObj();
const retroQuestions = retros.getRetrosObj();

let firestoreFuncs = require('../firestore');

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
        util = require('../util');
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
    });

    it('Testing javascript', () => {
      url = generateTaskData.generateCodingChallenge('javascript',1);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/js/');
    });

    it('Testing java', () => {
      url = generateTaskData.generateCodingChallenge('java',2);
      assert.equal(url.substring(0, 38),'http://www.speedcoder.net/lessons/java');
    });

    it('Testing c', () => {
      url = generateTaskData.generateCodingChallenge('c',3);
      assert.equal(url.substring(0, 35),'http://www.speedcoder.net/lessons/c');
    });

    it('Testing c++', () => {
      url = generateTaskData.generateCodingChallenge('c++',5);
      assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/cpp');
    });

    it('Testing Exception', () =>{
      assert.throws( function() {  generateTaskData.generateCodingChallenge('rust',5); }, Exception );
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

    it('Testing Exception', () =>{
      assert.throws( function() {  generateTaskData.generateMessageToSend('exercise', 'push-ups'); }, Exception );
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
          actions: [{value:''}]
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
});