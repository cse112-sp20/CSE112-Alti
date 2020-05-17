'use strict'

const assert = require('assert');
const index = require('../index');
const {app, token} = index.getBolt();

// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {

  let schedule;
  before(function () {
    schedule = require('../schedule');
  });

  it('schedule for 1 min after', async function() {
    let now = new Date();
    now.setTime(now.getTime() + 60000); 
    let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing");
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
    before(async function () {
      firestoreFuncs = require('../firestore');
      workspaceInfo = await app.client.team.info({
        token: token
      })
    });

    it('Test Pairup with testing channel', async function() {
      
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

