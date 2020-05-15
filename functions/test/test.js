'use strict'

var assert = require('assert');
const delay = require('delay');
const request = require('request');
// If it passes, means the function finished and message was scheduled, baseline test
// Need more rigorous testing using promises of async function and validation from Slack API channel reading
describe('Scheduler', function() {
  
  let slackMock;
  let schedule = require('../schedule');
  const token = 'xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT';

  before(function () {
    slackMock = new(require('../test_index'))();

    slackMock.reset()

    // wait for RTM flow to complete
    return delay(50); // change it if its too short. Less than 2000
  })


  after(function () {
    // clean up server
    return slackMock.rtm.stopServer(token);
  })

  it('should start an rtm connection after the oauth flow', function (done) {
    slackMock.web.addResponse({
      url: 'https://slack.com/api/oauth.access',
      status: 200,
      body: {
        ok: true,
        access_token: 'xoxp-XXXXXXXX-XXXXXXXX-XXXXX',
        scope: 'incoming-webhook,commands,bot',
        team_name: 'Team Installing Your Hook',
        team_id: 'XXXXXXXXXX',
        bot: {
          bot_user_id: 'UTTTTTTTTTTR',
          bot_access_token: token
        }
      }
    })

    slackMock.web.addResponse({
      url: 'https://slack.com/api/rtm.start',
      status: 200,
      body: {
        ok: true,
        self: {
          name: 'mockSelf',
          id: 'Bmock'
        },
        team: {
          name: 'mockTeam',
          id: 'Tmock'
        }
      }
    })

    request({
      method: 'POST',
      uri: 'http://localhost:9000/oauth',
      qs: {
        code: 'abc123'
      }
    }, (err) => {
      if (err) {
        return done(err)
      }

      return delay(250) // wait for oauth flow to complete, rtm to be established
        .then(() => {
          return slackMock.rtm.send(botToken, {
            type: 'message',
            channel: 'mockChannel',
            user: 'usr',
            text: 'hello'})
        })
        .then(delay(20))
        .then(() => {
          expect(slackMock.rtm.calls).to.have.length(1)
          expect(slackMock.rtm.calls[0].message.text).to.equal('GO CUBS')
        })
        .then(() => done(), (e) => done(e))
    })
  })

  it('schedule for 1 min after', async function() {
    let now = new Date();
    now.setTime(now.getTime() + 60000); 
    let response = await schedule.warmupMsgs(now.getHours(), now.getMinutes());
    //console.log(response);
    assert.equal(response.ok, true);
  });
});

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

