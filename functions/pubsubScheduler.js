const index = require('./index')
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const app = index.getBolt();

exports.scheduledPairUp = functions.pubsub
                            .schedule('every monday, thursday 00:44')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    
    app.use(({context}) => pairUp.pairUp(context, context.botToken));
    
    app.use(({context}) =>  { 
      app.client.chat.postMessage({
        token: context.botToken,
        channel: '#general',
        text: `Paired up people in this channel (scheduled).`
    })});
    return null;
  });

exports.scheduleWarmup = functions.pubsub
                            .schedule('every mon,tue,wed,thu,fri 00:10')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    app.use(({context}) => schedule.scheduleMsg(9, 0, "A reminder for warmup", "#general", context.botToken));
    return null;
});