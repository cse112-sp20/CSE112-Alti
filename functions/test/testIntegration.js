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

// Integration Testing goes here
describe('Integration Testing', () => {
  // If it passes, means the function finished and message was scheduled, baseline test
  // Need more rigorous testing using promises of async function and validation from Slack API channel reading
  
  describe('Scheduler', () => {
   
    let schedule;
    before(async () => {
      schedule = require('../schedule');
    });

    it('schedule for 2 min after', async function() {
      this.timeout(5000); // 5 sec
      let initial = new Date();
      let now = new Date();
      var localTime = now.getTime();
      let localOffset = now.getTimezoneOffset()*60000;
      let utc = localTime + localOffset;
      let offset = -7;
      let cali = (utc + (3600000 * offset));
      let newDate = new Date(cali);
      now = newDate;
      //console.log("Now time after converting: " + now.getTime());
      now.setTime(now.getTime() + 120000); 

      var response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                      "A reminder", "#testing", token);
      assert.equal(response.ok, true);

      //console.log("RESPONSE: ", response);
      //console.log("Initial:  " + initial.getTime());
      //console.log("Initial offset: " + initial.getTimezoneOffset());
      app.client.chat.deleteScheduledMessage({
        token: token,
        channel: "testing",
        scheduled_message_id: response.scheduled_message_id
      });
                                                      
      //console.log(response);
      let postAtTime = parseInt(response.post_at, 10);
      let scheduleTime = initial.getTime()/1000;

      //console.log("Post at time: " + postAtTime);
      //console.log("scheduleTime: " + scheduleTime);
      assert(postAtTime-scheduleTime < 5000, "The schedule time does not match with input"); // allow 5 sec delay
    });

    it('schedule for 1 min before', async () => {
      let now = new Date();
      now.setTime(now.getTime() - 60000); 
      let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                      "A failed reminder", "#testing", token);
      assert.equal(response.ok, false);
    });

    it('schedule for 4 min after', async function() {
      this.timeout(5000); // 5 sec
      // Submit hours and minutes that are in pst to schedule msg
      let initial = new Date();
      let now = new Date();
      var localTime = now.getTime();
      let localOffset = now.getTimezoneOffset()*60000;
      let utc = localTime + localOffset;
      let offset = -7;
      let cali = (utc + (3600000 * offset));
      let newDate = new Date(cali);
      now = newDate;
      //console.log("Now time after converting: " + now.getTime());
      now.setTime(now.getTime() + 240000); 

      var response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                      "A reminder", "#testing", token);
      assert.equal(response.ok, true);

      //console.log("RESPONSE: ", response);
      //console.log("Initial:  " + initial.getTime());
      //console.log("Initial offset: " + initial.getTimezoneOffset());
      app.client.chat.deleteScheduledMessage({
        token: token,
        channel: "testing",
        scheduled_message_id: response.scheduled_message_id
      });
                                                      
      //console.log(response);
      let postAtTime = parseInt(response.post_at, 10);
      let scheduleTime = initial.getTime()/1000;

      //console.log("Post at time: " + postAtTime);
      //console.log("scheduleTime: " + scheduleTime);
      assert(postAtTime-scheduleTime < 5000, "The schedule time does not match with input"); // allow 5 sec delay
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

        var partner1 = pairs[0]["users"][0];
        var partner2 = pairs[0]["users"][1];

        var randomNum = Math.floor(Math.random() * (pairs.length-1));

        var randompartner1 = pairs[randomNum]["users"][0];
        var randompartner2 = pairs[randomNum]["users"][1];

        var lastpartner1 = pairs[pairs.length-1]["users"][0];
        var lastpartner2 = pairs[pairs.length-1]["users"][1];

        // Checking first partner group
        var otherPartner = await firestoreFuncs.getPartner(workspaceId, channelId, partner1);
        assert.equal(otherPartner, partner2);

        otherPartner = await firestoreFuncs.getPartner(workspaceId, channelId, partner2);
        assert.equal(otherPartner, partner1);

        // Checking random partner group
        otherPartner = await firestoreFuncs.getPartner(workspaceId, channelId, randompartner1);
        assert.equal(otherPartner, randompartner2);

        otherPartner = await firestoreFuncs.getPartner(workspaceId, channelId, randompartner2);
        assert.equal(otherPartner, randompartner1);

        // Checking last partner group
        otherPartner = await firestoreFuncs.getPartner(workspaceId, channelId, lastpartner1);
        assert.equal(otherPartner, lastpartner2);

        otherPartner = await firestoreFuncs.getPartner(workspaceId, channelId, lastpartner2);
        assert.equal(otherPartner, lastpartner1);

        // Checking invalid response
        var invalidPart = await firestoreFuncs.getPartner(workspaceId, channelId, "XXXXXXXXXX");
        assert.equal(invalidPart, undefined);
      });  
    });
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
});