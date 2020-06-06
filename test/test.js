'use strict'
const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;
const index = require('../javascript/index');
const testUtil = require('./testUtil');
const app = index.getBolt();

var generateTaskData = require ('../javascript/generateTaskData');
const quotes = require('../javascript/quotes');
const retros = require('../javascript/retros');
const motivationalQuotes = quotes.getQuotesObj();
const retroQuestions = retros.getRetrosObj();

let firestoreFuncs = require('../javascript/firestore');

const functions = require('./node_modules/firebase-functions');
const config = functions.config();
let token = config.slack.bot_token;
// Unit Tests  go Here
describe('Unit Testing', () => {
  describe('util', () => {
    describe('Test getChannelIdByName', () => {
      // helps to find the channel ids
      let util;
      before(async () => {
        util = require('../javascript/util');
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
      onBoard = require('../javascript/onBoard');
      util = require('../javascript/util')
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