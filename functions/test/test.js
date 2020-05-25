'use strict'
const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;
const index = require('../index');
const app = index.getBolt();
var generateTaskData = require('../generateTaskData');
const admin = require('firebase-admin');
let db = admin.firestore();
let firestoreFuncs = require('../firestore');

//hardcode the token 
let token = "xoxb-1109790171392-1110712837169-OxF8igcVuxkFUhbZVuoXxypj";

async function setupPairs(workspaceId, channelId)
{
  // Create new Channel "Pairing Channel"

  let pair1 = ["U01236C905V", "U012HPHS2FR"];
  let pair2 = ["U012P9C053Q", "U012RQ0TQG6"];
  let pair3 = ["U012X3JJS78", "U012YEB5HR8"];
  let pair4 = ["U012YGB2M50", "U0133SAJ0E7"];

  await firestoreFuncs.storeNewPairingChannel(workspaceId, channelId);

  getdmThreadID(pair1).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair1);
  });
  getdmThreadID(pair2).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair2);
  });
  getdmThreadID(pair3).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair3);
  });
  getdmThreadID(pair4).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair4);
  });
  return Promise.resolve();
}

async function clearDatabase(path)
{
  let collectionRef = db.collection(path);
  let query = collectionRef.orderBy('__name__').limit(100);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

/*
    Description:
        Helper function for deleteCollection
*/
function deleteQueryBatch(query, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
          return 0;
      }

      // Delete documents in a batch
      let batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        //console.log(doc.ref);
      });

      // eslint-disable-next-line promise/no-nesting
      return batch.commit().then(() => {
        return snapshot.size;
      });
    }).then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(query, resolve, reject);
      });
      // eslint-disable-next-line consistent-return
      return null;
    })
    .catch(reject);
}

async function populateUsers(workspaceId) {
  let schedule = {'FridayEnd': '5:00 PM',
                  'ThursdayEnd': '5:00 PM',
                  'WednesdayEnd': '5:00 PM',
                  'TuesdayEnd': '5:00 PM',
                  'MondayEnd': '5:00 PM',
                  'FridayStart': '9:00 AM',
                  'ThursdayStart': '9:00 AM',
                  'WednesdayStart': '9:00 AM',
                  'TuesdayStart': '9:00 AM', 
                  'MondayStart': '9:00 AM'};
  let users = ["U01236C905V", "U012HPHS2FR",
               "U012P9C053Q", "U012RQ0TQG6" ,
               "U012X3JJS78", "U012YEB5HR8" , 
               "U012YGB2M50", "U012YNT21C3" ,
               "U0132DWLTT7", "U0133SAJ0E7" ,
               "U01341THLV9", "U01341VGSE7" ,
               "U0134PZ89UL", "U013G97PNFK"];
  
  /* eslint-disable no-await-in-loop */
  for(let i = 0; i < users.length; i++)
    await db.collection("workspaces").doc(workspaceId).collection("users").doc(users[i]).set(schedule);
  /* eslint-enable no-await-in-loop */
}

async function getdmThreadID(users)
{
  var check = await app.client.conversations.open({
    token: token, 
    return_im: false,
    users: users[0] + "," + users[1]
  });

  app.client.chat.postMessage({
    token:token,
    channel: (check.channel).id, 
    text: "Testing making thread with api"
  });

  return check.channel.id;
}

// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', () => {
 
  let schedule;
  before(async () => {
    schedule = require('../schedule');
  });

  it('schedule for 2 min after', async () => {
    let now = new Date();
    now.setTime(now.getTime() + 120000); 
    var response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing", token);
    
    // console.log("RESPONSE: ", response);
    app.client.chat.deleteScheduledMessage({
      token: token,
      channel: "testing",
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
    let workspaceInfo;
    let workspaceId = "T0137P851BJ";
    let channelId = "C012B6BTVDL";

    before(async () => {
      await firestoreFuncs.storeNewPairingChannel(workspaceId, channelId);
    });

    after(async() => {
      await clearDatabase('/workspaces/' + workspaceId + '/activeChannels/' + channelId + '/pairedUsers');
    })

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

      //await pairUp.pairUp(undefined, token);
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
      // var response = await app.client.conversations.list({
      //   token: token
      // })
      //var channels = response.channels;
      //console.log(channels)
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

// This functions assumes that the HandleQuoteSelect function
// only sets warmups. Needs to be changed when cooldowns are added
// Does not test the generated url. Only checks the prompt stored in the firestore 
describe('Setup Warmup Callbacks', () => {
  let firestoreFuncs;
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

  before(async () => {    
    fakeContext = { botToken: token};
    firestoreFuncs = require('../firestore');
    return setupPairs('T0137P851BJ','C012B6BTVDL').then(response => {
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
    firestoreFuncs.storeTypeOfExercise(workspaceId, userId2, true, "");
    ackCalled = false;
    setTimeout(done, 1000);
  });


  it('handleTypingSelect', () => {  
    fakeBody.actions[0].value = 'java';
    var exercisePrompt = handleTypingSelect(fakeAck, fakeBody, fakeContext).then( () => {
      return firestoreFuncs.getExercisePrompt(workspaceId, userId2, true)
    })

    return exercisePrompt.then( prompt => {
      var expectedString = "Your partner sent you this cool speed coding challenge in java to get your mind and fingers ready for the day!\nComplete it here: ";
      assert.equal(ackCalled, true);
      assert.equal(prompt.substring(0,expectedString.length), expectedString);
      return Promise.resolve();
    });
  });
    
  it('handlePuzzleSelect', () => {
    fakeBody.actions[0].value = 'sudoku';
    var exercisePrompt = handlePuzzleSelect(fakeAck, fakeBody, fakeContext).then( ret => {
      return firestoreFuncs.getExercisePrompt(workspaceId, userId2, true)
    })
    return exercisePrompt.then( prompt => {
      var expectedString = "Your partner sent you this sudoku puzzle to help you get those brain juices flowing!\nComplete it here: ";
      assert.equal(ackCalled, true);
      assert.equal(prompt.substring(0,expectedString.length), expectedString);
      return Promise.resolve();
    });
  });
});

// describe('App Home tests', () => {
//   let appHome;
//   let onBoard;
//   let workspaceId;
//   let firestoreFuncs;
//   let userId;
//   before(async () => {
//     appHome = require('../appHome'); 
//     onBoard = require('../onBoard');
//     firestoreFuncs = require('../firestore');
//     workspaceId = "TestWorkspace";
//     userId = "user1";
//     await firestoreFuncs.setTimeZone(workspaceId, 'LA');
//     await firestoreFuncs.setOwner(workspaceId, userId);
//     await firestoreFuncs.storeNewPairingChannel(workspaceId, "Channel1");
//   });

//   it('Get time zone', async () => {
//     var timeZone = await firestoreFuncs.getTimeZone(workspaceId).then((obj)=>{
//       return obj;
//     }).catch((error) => {
//           console.log(error);
//     });
//     assert.equal(timeZone, "LA");

//   });


//   it('Check Owner', async () => {
//     var t = await appHome.checkOwner(workspaceId, userId);
//     assert.equal(t, true);

//   });

//   it('Get Pairing Channel', async () => {
//     var channelId = await firestoreFuncs.getPairingChannel(workspaceId).then((obj)=>{
//       return obj;
//     }).catch((error) => {
//           console.log(error);
//       });
//     assert.equal(channelId, "Channel1");

//   });

//   it('Test getAllTimes function', async () => {
//     var res = await appHome.getAllTimes(workspaceId, userId);  
//     for (var i = 0; i < 10; i++) {
//       assert.equal(res[i], i+1);
//     }
//   });

// });


// U01236C905V Ani
// U012HPHS2FR Daniel
// U012P9C053Q Jeremiah
// U012RQ0TQG6 Alvin
// U012X3JJS78 Shardul Bot
// U012YEB5HR8 Jonathan Leigh
// U012YGB2M50 Rahul
// U012YNT21C3 Him Li
// U0132DWLTT7 Lacey Umamoto
// U0133SAJ0E7 Jason Ding
// U01341THLV9 Brent Vanzant
// U01341VGSE7 Thomas Limperis
// U0134PZ89UL Eric Wei
// U013G97PNFK Ruixan Song