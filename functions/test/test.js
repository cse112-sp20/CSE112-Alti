'use strict'

var assert = require('assert');
// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {
  
  let slackMock;
  let schedule = require('../schedule');

  before(function () {
    slackMock = require('../test_index').instance;
    const token = 'xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT';

    slackMock.reset()

    // wait for RTM flow to complete
    return delay(50)
  })


  after(function () {
    // clean up server
    return slackMock.rtm.stopServer(token);
  })

  it('schedule for 1 min after', async function() {
    now = new Date();
    now.setTime(now.getTime() + 60000); 
    response = await schedule.warmupMsgs(now.getHours(), now.getMinutes());
    //console.log(response);
    assert.equal(response.ok, true);
  });

  it('Schedule for 1 min before', async function() {
    now = new Date();
    now.setTime(now.getTime() - 60000);
    response = await schedule.warmupMsgs(now.getHours(), now.getMinutes());
    //console.log(response);
    assert.equal(response.ok, false);
  });
});

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

