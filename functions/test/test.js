'use strict'

var assert = require('assert');
var schedule = require('../schedule');
var generateTaskData = require('../generateTaskData');
// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {

  it('schedule for 1 min after', async function() {
    let now = new Date();
    now.setTime(now.getTime() + 60000);
    let response = await schedule.scheduleMsg(now.getHours(), now.getMinutes(),
                                                    "A reminder", "#general");
    //console.log(response);
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
