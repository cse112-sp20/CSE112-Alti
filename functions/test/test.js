'use strict'
const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;
const index = require('../index');
const app = index.getBolt();
var generateTaskData = require('../generateTaskData');

//hardcode the token 

let token = "xoxb-1109790171392-1110712837169-OxF8igcVuxkFUhbZVuoXxypj";

// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', () => {
 
  let schedule;
  before(() => {
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
    let firestoreFuncs;
    let workspaceInfo;
    let workspaceId;
    let testChannelId = "C012B6BTVDL" // got that from the console.

    before(async () => {
      firestoreFuncs = require('../firestore');
      workspaceInfo = await app.client.team.info({
        token: token
      });
      workspaceId = workspaceInfo.team.id;
      
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
  });
});

describe('util', () => {
  describe('Test getChannelIdByName', () => {
    // helps to find the channel ids
    let util;
    before(async () => {
      util = require('../util');
      var response = await app.client.conversations.list({
        token: token
      })
      var channels = response.channels;
      //console.log(channels)
    });
    
    it('Test with channel general', async () => {
      var channelId = await util.getChannelIdByName(app, token, "general");
      assert.equal(channelId, "C012WGXPYC9"); //hardcoded it with console.log
    });

    it('Test with channel alti-paring', async () => {
      var channelId = await util.getChannelIdByName(app, token, "alti-pairing");
      assert.equal(channelId, "C01391DPZV4"); //hardcoded it with console.log
    });

    it('Test with channel that doesnt exist', async () => {
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


describe('App Home', () => {
  let appHome;
  let onBoard;
  let workspaceId;
  let firestoreFuncs;
  let userId;
  before(async () => {
    appHome = require('../appHome'); 
    onBoard = require('../onBoard');
    firestoreFuncs = require('../firestore');
    workspaceId = "TestWorkspace";
    userId = "user1";
    await firestoreFuncs.setTimeZone(workspaceId, 'LA');
    await firestoreFuncs.setOwner(workspaceId, userId);
    await firestoreFuncs.storeNewPairingChannel(workspaceId, "Channel1");
  });

  it('Get and Set time zone', async () => {
    var timeZone = await firestoreFuncs.getTimeZone(workspaceId).then((obj)=>{
      return obj;
    }).catch((error) => {
          console.log(error);
    });
    assert.equal(timeZone, "LA");

  });

  describe('Set Time Zone', () => {
    before(async() => {
      await firestoreFuncs.setTimeZone(workspaceId, "Space");
    });

    it('Set Time Zone', async () => {
      var timeZone = await firestoreFuncs.getTimeZone(workspaceId).then((obj)=>{
        return obj;
      }).catch((error) => {
            console.log(error);
      });
      assert.equal(timeZone, "Space");
    })
  });

  it('Set and Check Owner', async () => {
    var t = await appHome.checkOwner(workspaceId, userId);
    assert.equal(t, true);

    describe('Set Owner', async() => {
      before(async() => {
        await firestoreFuncs.setOwner(workspaceId, "Doctor who");
      });
      it('Set Owner', async () => {
        var t = await appHome.checkOwner(workspaceId, "user1");
        assert.equal(t, false);
      });
    });
  });

  it('Get and Set Pairing Channel', async () => {
    var channelId = await firestoreFuncs.getPairingChannel(workspaceId).then((obj)=>{
      return obj;
    }).catch((error) => {
          console.log(error);
      });
    assert.equal(channelId, "Channel1");
    
    describe('Set Pairing Channel', () => {
      before(() => async () => {
        await firestoreFuncs.storeNewPairingChannel(workspaceId, "Channel2");
      });
      it('Check Set Pairing Channel', async () => {
        var channelId = await firestoreFuncs.getPairingChannel(workspaceId).then((obj)=>{
          return obj;
        }).catch((error) => {
              console.log(error);
          });
        assert.equal(channelId, "Channel2");
      });
    });
    
  });

  it('Test getAllTimes function', async () => {
    var res = await appHome.getAllTimes(workspaceId, userId);  
    console.log(res);
    for (var i = 0; i < 10; i++) {
      assert.equal(res[i], i+1);
    }
  });

});
