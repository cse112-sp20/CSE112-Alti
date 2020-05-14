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

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {
	describe('Reminder Message', function() {
		it('Should pass if correctly scheduled', async function() {
			await assert(
    			() => schedule.warmupMsgs(),
    			{
      				constructor: Error,
     	 			message: 'This new error thows!'
    			},
    			'Promise not rejected'
			);
		});
	});
});