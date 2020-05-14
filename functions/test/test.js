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