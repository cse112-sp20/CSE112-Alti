const index = require('./index')
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const warmupMessage = require('./warmupMessage');
const app = index.getBolt();

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* Scheduling Idea:
/ Pair everyone up on Monday mornings and in the intro DM, send a motivational quote as a warmup
/ for both partners and immediately ask them to select a cooldown activity for their partner's 
/ Monday cooldown. 
/ On other weekdays, send each person their warmup in the morning, cooldown in the evening, and
/ prompt for their warmup and cooldown selection for their partner in the evening too.
/ (Morning = start of workday, Evening = end of workday)
*/

exports.scheduledPairUp = functions.pubsub
                            .schedule('every monday 00:44')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    
    app.use(({context}) => pairUp.pairUp(context, context.botToken));
    
    app.use(({context}) =>  { 
      app.client.chat.postMessage({
        token: context.botToken,
        channel: '#general',
        text: `Paired up people in this channel (scheduled).`
      });
    });
    return null;
  });

exports.scheduleWarmup = functions.pubsub
                            .schedule('every mon,tue,wed,thu,fri 00:10')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    app.use(({context}) => schedule.scheduleMsg(9, 0, "A reminder for warmup", "#general", context.botToken));
    
    
});

exports.scheduleDaily = functions.pubsub
                          .schedule('every mon,tue,wed,thu,fri 00:10')
                          .timeZone('America/Los_Angeles')
                          .onRun((context) => {
    // Look through workspace's users in db and schedule warmup for each user
    scheduleDailyHelper();

});

async function scheduleDailyHelper() {
  let workspaces = await firestoreFuncs.getAllWorkspaces();
    console.log(workspaces);
    for (var w of workspaces) {
      console.log("Workspace: " + w);
      scheduleDailyWorkspace(w);
    }
    return null;
}

async function scheduleDailyWorkspace(workspaceId) {
  var d = new Date();
  var n = d.getDay();
  var day = days[n];
  console.log(day);

  var keyObj = await firestoreFuncs.getAPIPair(workspaceId);
  if (!keyObj) {
    console.log("No API key");
    return;
  }
  
  var w_token = keyObj.botToken;

  let channel = await firestoreFuncs.getPairingChannel(workspaceId);

  if (!channel) {
    console.log("No pairing channel");
    return;
  }
  else {
    console.log("Pairing Channel: " + channel);
  }
  let convoObj = await app.client.conversations.members({
    token: w_token,
    channel: channel
  }).catch((error) => {
    console.log(error);
  });

  let memberList = convoObj.members;
  for (var m of memberList) {
    scheduleDailyUser(workspaceId, m, w_token, day);
  }

}

async function scheduleDailyUser(workspaceId, userId, token, day) {
  console.log("user: " + userId);
  let channel_id;
  // TODO make firestore function to get thread id
  // Grab channel id, warm up text, cooldown text, warmup time, cooldown time
  // Schedule warmup msg at warmup time
  // Schedule cooldown msg at cooldown time

  // schedule.scheduleMsg(hour, min, text, channel_id, token);
}