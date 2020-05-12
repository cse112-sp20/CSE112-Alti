const index = require('./index')
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const {app, token} = index.getBolt();

exports.scheduledPairUp = functions.pubsub
                            .schedule('every monday, thursday 00:44')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    
    pairUp.pairUp(app, token, "general");
    
    app.client.chat.postMessage({
        token: token,
        channel: '#general',
        text: `Paired up people in this channel (scheduled).`
    });
    return null;
  });

exports.scheduleWarmup = functions.pubsub
                            .schedule('every mon,tue,wed,thu,fri 00:10')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    schedule.warmupMsgs();
    return null;
});