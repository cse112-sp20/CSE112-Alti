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

// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', () => {
 
  let schedule;
  before(async () => {
    schedule = require('../schedule');
  });

  it('schedule for 2 min after', async function() {
    this.timeout(5000); // 5 sec
    let now = new Date();
    let localTime = now.getTime();
    let localOffset = now.getTimezoneOffset()*60000;
    let utc = localTime + localOffset;
    let offset = -7;
    let cali = (utc + (3600000 * offset));
    let newDate = new Date(cali);
    now = newDate;
    now.setTime(now.getTime() + 120000); 
    assert.equal(now.getHours, 21);
    var response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing", token);
    assert.equal(response.error, undefined);                                                
    assert.equal(response.ok, true);
    console.log("RESPONSE: ", response);
    app.client.chat.deleteScheduledMessage({
      token: token,
      channel: "#testing",
      scheduled_message_id: response.scheduled_message_id
    });
                                                    
    //console.log(response);
    assert.equal(response.ok, true);
  });

  it('schedule for 1 min before', async () => {
    let now = new Date();
    now.setTime(now.getTime() - 60000); 
    let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing");
    //console.log(response);
    assert.equal(response.ok, false);
  });

});

describe('Pairup', () => {

  let pairUp;
  
  before(() => {
    pairUp = require('../pairUp');
  });

  describe('Test the pairup function as a whole', () => {
    let workspaceId = "T0137P851BJ";
    let channelId = "C012B6BTVDL";

    before(async () => {
      await testUtil.setupWorkspace(workspaceId);
    });

    beforeEach(async function() {
      this.timeout(5000) // 5 sec
      await firestoreFuncs.storeNewPairingChannel(workspaceId, channelId);
    });

    afterEach(async () => {
      await testUtil.deleteWorkspace(workspaceId);
    }); 

    it('Test Pairup with testing channel', async function() {
      this.timeout(180000) // 3 min

      await pairUp.pairUp(undefined, token);
      var pairs = await firestoreFuncs.getPairedUsers(workspaceId);
      //console.log(pairs);
      /* eslint-disable no-await-in-loop */
      for(var i = 0; i < pairs.length; i++)
      {
        var pair = pairs[i];
        var m = await app.client.conversations.members({
          token:token, 
          channel: pair["dmThreadID"]
        });
        //console.log(m.members);
        //console.log(pair);

        (((m.members).should).have).lengthOf(3);
        expect(m.members).to.include.members(pair["users"]);
      }
      /* eslint-enable no-await-in-loop */
    }); 

    it('Test Pairup random users', async function() {
      this.timeout(180000);

      await pairUp.pairUp(undefined, token);
      var pairs = await firestoreFuncs.getPairedUsers(workspaceId);
      //console.log(pairs);
      /* eslint-disable no-await-in-loop */

      var partner1 = [];
      var partner2 = [];
      var pairChannel = [];

      for(var i = 0; i < pairs.length; i++)
      {
        var pair = pairs[i];
        var m = await app.client.conversations.members({
          token:token, 
          channel: pair["dmThreadID"]
        });

        //console.log(pair);

        partner1.push(pair["users"][0]);
        partner2.push(pair["users"][1]);
      }
      /* eslint-enable no-await-in-loop */
      // console.log(partner1[0]);
      // console.log(partner2[0]);
      // console.log(pairChannel[0]);

      // Waiting on latest pull to firestore
      // var otherPartner = await firestoreFuncs.getPartner(workspaceId, partner1[0]);
      // console.log(otherPartner);
      // assert.equal(otherPartner, partner2[0]);

      // otherPartner = await firestoreFuncs.getPartner(workspaceId, pairChannel[0], partner2[0]);
      // assert.equal(otherPartner, partner1[0]);

      // var invalidPart = await firestoreFuncs.getPartner(workspaceId, pairChannel[1], "XXXXXXXXXX");
      // assert.equal(invalidPart, undefined);
    });  
  });

});

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
  
})


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

  beforeEach((done) => {
    ackCalled = false;
    setTimeout(()=>{
      firestoreFuncs.storeTypeOfExercise(workspaceId, userId1, true, "");
      done();
    }, 1000);
  });

  after(async() => {
    await testUtil.deleteWorkspace(workspaceId);
  })

  it('handleTypingSelect', () => {  
    fakeBody.actions[0].value = 'java';
    let selectPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(handleTypingSelect(fakeAck, fakeBody, fakeContext));
      }, 1000);
    });
    
    let typingPrompt = selectPromise.then((res) => {
      let ret = new Promise((resolve, reject) => {
        setTimeout(() => {
          return resolve(firestoreFuncs.getExercisePrompt(workspaceId, userId2, true));
        }, 1000);
      });
      return ret;
    });

    return typingPrompt.then( prompt => {
      let expectedString = "Your partner sent you this cool speed coding challenge in java to get your mind and fingers ready for the day!\nComplete it here: ";
      assert.equal(ackCalled, true);
      assert.equal(prompt.substring(0,expectedString.length), expectedString);
      return Promise.resolve();
    });
  }).timeout(7000);
    
  it('handlePuzzleSelect', () => {
    fakeBody.actions[0].value = 'sudoku';
    let selectPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(handlePuzzleSelect(fakeAck, fakeBody, fakeContext));
      }, 1000);
    });

    let puzzlePrompt = selectPromise.then((res) => {
      let ret = new Promise((resolve, reject) => {
        setTimeout(() => {
          return resolve(firestoreFuncs.getExercisePrompt(workspaceId, userId2, true));
        }, 1000);
      });
      return ret;
    });
    return puzzlePrompt.then( prompt => {
      let expectedString = "Your partner sent you this sudoku puzzle to help you get those brain juices flowing!\nComplete it here: ";
      assert.equal(ackCalled, true);
      assert.equal(prompt.substring(0,expectedString.length), expectedString);
      return Promise.resolve();
    });
  }).timeout(7000);
});

describe('App Home tests', () => {
  let appHome;
  let onBoard;
  let workspaceId;
  let userId;
  before(async () => {
    appHome = require('../appHome'); 
    onBoard = require('../onBoard');
    workspaceId = "TestWorkspace";
    userId = "user1";
    await firestoreFuncs.setTimeZone(workspaceId, 'LA');
    await firestoreFuncs.setOwner(workspaceId, userId);
    await firestoreFuncs.storeNewPairingChannel(workspaceId, "Channel1");

    // example of schedule
    let schedule = {'FridayEnd': '10',
                  'ThursdayEnd': '8',
                  'WednesdayEnd': '6',
                  'TuesdayEnd': '4',
                  'MondayEnd': '2',
                  'FridayStart': '9',
                  'ThursdayStart': '7',
                  'WednesdayStart': '5',
                  'TuesdayStart': '3', 
                  'MondayStart': '1'};
    await testUtil.customPopulateUsers(workspaceId, [{user: userId, schedule: schedule}]);
  });

  after(async() => {
    await testUtil.deleteWorkspace(workspaceId);
  })

  it('Get time zone', async () => {
    var timeZone = await firestoreFuncs.getTimeZone(workspaceId).then((obj)=>{
      return obj;
    }).catch((error) => {
          console.log(error);
    });
    assert.equal(timeZone, "LA");
  });


  it('Check Owner', async () => {
    var t = await appHome.checkOwner(workspaceId, userId);
    assert.equal(t, true);
  });

  it('Get Pairing Channel', async () => {
    var channelId = await firestoreFuncs.getPairingChannel(workspaceId).then((obj)=>{
      return obj;
    }).catch((error) => {
          console.log(error);
      });
    assert.equal(channelId, "Channel1");

  });

  it('Test getAllTimes function', async () => {
    var res = await appHome.getAllTimes(workspaceId, userId);  
    for (var i = 0; i < 10; i++) {
      assert.equal(res[i], i+1);
    }
  });
});
