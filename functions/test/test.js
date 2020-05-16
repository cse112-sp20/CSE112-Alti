'use strict'

var assert = require('assert');
var schedule = require('../schedule');
// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {

  it('schedule for 1 min after', async function() {
    let now = new Date();
    now.setTime(now.getTime() + 60000); 
    let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#testing");
    console.log(response);
    assert.equal(response.ok, true);
  });

  it('schedule for 1 min before', async function() {
    let now = new Date();
    now.setTime(now.getTime() - 60000); 
    let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(), 
                                                    "A reminder", "#general");
    //console.log(response);
    assert.equal(response.ok, false);
  });
});

describe('Pairup', function() {
  it('Test Pairup', async function() {
    
  });
});


describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

