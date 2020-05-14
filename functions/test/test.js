const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;
const bot_token = config.slack.bot_token;


const expressReceiver = new ExpressReceiver({
    signingSecret: signingSecret,
    endpoints: '/events',
});

const app = new App({
    receiver: expressReceiver,
    token: bot_token
});

exports.getBolt = function getBolt(){
    return {
        app:app,
        token:bot_token
    }
};

app.client.conversations.list
var assert = require('assert');

const schedule = require('../schedule');
// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {
	describe('Reminder Message', function() {
		it('schedule for 1 min after, should work', async function() {
      now = new Date();
      now.setTime(now.getTime() + 60000); 
      response = await schedule.warmupMsgs(now.getHours(), now.getMinutes());
      //console.log(response);
      assert.equal(response.ok, true);
      
		});
	});
});

describe('Scheduler', function() {
	describe('Reminder Message', function() {
		it('Schedule for 1 min before, should not work', async function() {
      now = new Date();
      now.setTime(now.getTime() - 60000);
      response = await schedule.warmupMsgs(now.getHours(), now.getMinutes());
      //console.log(response);
      assert.equal(response.ok, false);
		});
	});
});

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

