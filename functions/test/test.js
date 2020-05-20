'use strict'
const assert = require('assert');
const index = require('../index');
const {app, token} = index.getBolt();

var schedule = require('../schedule');
var generateTaskData = require('../generateTaskData');
// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {

  let schedule;
  before(function () {
    schedule = require('../schedule');
  });

  it('schedule for 2 min after', async function() {
    let now = new Date();
    now.setTime(now.getTime() + 120000); 
    var response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing");
    app.client.chat.deleteScheduledMessage({
      token: token,
      channel: "testing",
      scheduled_message_id: response.scheduled_message_id
    });
                                                    
    //console.log(response);
    assert.equal(response.ok, true);
  });

  it('schedule for 1 min before', async function() {
    let now = new Date();
    now.setTime(now.getTime() - 60000); 
    let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing");
    //console.log(response);
    assert.equal(response.ok, false);
  });

});

describe('Pairup', function() {
  let pairUp;

  before(function() {
    pairUp = require('../pairUp');
  });

  describe('Test the pairup function as a whole', function() {
    let firestoreFuncs;
    let workspaceInfo;
    let workspaceId;
    let testChannelId = "C012B6BTVDL" // got that from the console.

    before(async function () {
      firestoreFuncs = require('../firestore');
      workspaceInfo = await app.client.team.info({
        token: token
      })
      workspaceId = workspaceInfo.team.id;
      // await firestoreFuncs.getPairingChannel(workspaceId).then( channel => {
      //   if(channel == undefined)
      //     firestoreFuncs.storeNewPairingChannel(workspaceId, testChannelId);
      // });
      
    });

    it('Test Pairup with testing channel', async function() {
     this.timeout(180000) // 1 min
      try {
        const response = await pairUp.pairUp("testing");
        var pairs = await firestoreFuncs.getPairedUsers(workspaceId);
        console.log(pairs);

        // //console.log(slackResponse.channels[0]);
        // var members = await app.client.conversations.members({
        //   token:token, 
        //   channel: slackResponse.channels[0].id
        // });

      } catch(error) {
        console.log("----------- ERROR ------------")
        console.log(error);
      }
    });  


  });
  
  describe('Test getChannelIdByName', function(){
    // helps to find the channel ids
    before(async function () {

      var response = await app.client.conversations.list({
        token: token
      })
      var channels = response.channels;
      //console.log(channels)
    });
    
    it('Test with channel general', async function() {
      var channelId = await pairUp.getChannelIdByName(app, token, "general");
      assert.equal(channelId, "C012WGXPYC9"); //hardcoded it with console.log
    });

    it('Test with channel alti-paring', async function() {
      var channelId = await pairUp.getChannelIdByName(app, token, "alti-pairing");
      assert.equal(channelId, "C01391DPZV4"); //hardcoded it with console.log
    });

    it('Test with channel that doesnt exist', async function() {
      var channelId = await pairUp.getChannelIdByName(app, token, "should not exist");
      assert.equal(channelId, undefined); 
    });
  })
  
});


describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('generateCodingChallenge', function() {
  it('Testing english', function()
  {
    //generateCodingChallenge();
    url = generateTaskData.generateCodingChallenge('english');
    assert.equal(url,'https://www.typing.com/student/typing-test/1-minute');

    url = generateTaskData.generateCodingChallenge('english',3);
    assert.equal(url,'https://www.typing.com/student/typing-test/3-minute');

    url = generateTaskData.generateCodingChallenge('english',10);
    assert.equal(url,'https://www.typing.com/student/typing-test/5-minute');
  });

  it('Testing python', function()
  {
    url = generateTaskData.generateCodingChallenge('python',5);
    assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/py/');
  });

  it('Testing javascript', function()
  {
    url = generateTaskData.generateCodingChallenge('javascript',1);
    assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/js/');
  });

  it('Testing java', function()
  {
    url = generateTaskData.generateCodingChallenge('java',2);
    assert.equal(url.substring(0, 38),'http://www.speedcoder.net/lessons/java');
  });

  it('Testing c', function()
  {
    url = generateTaskData.generateCodingChallenge('c',3);
    assert.equal(url.substring(0, 35),'http://www.speedcoder.net/lessons/c');
  });

  it('Testing c++', function()
  {
    url = generateTaskData.generateCodingChallenge('c++',5);
    assert.equal(url.substring(0, 37),'http://www.speedcoder.net/lessons/cpp');
  });
});
