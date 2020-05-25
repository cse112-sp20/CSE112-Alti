const index = require('./index')
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const warmupMessage = require('./warmupMessage');
const generateTaskData = require('./generateTaskData');
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
                            .schedule('every sunday 13:00')
                            .timeZone('America/Los_Angeles')
                            .onRun(async (context) =>  {

  const allWorkspaces = await firestoreFuncs.getAllWorkspaces();

  for( i=0; i<allWorkspaces.length; i++){
    timedTask(i, allWorkspaces);
  }
  return null;
});

function timedTask(i, allWorkspaces){
  setTimeout(() => {
    const workspace = allWorkspaces[i];
    // if (  workspace !== "T0132A75VD3" && workspace !== "T0132A75VD3" ){
    //   return;
    // }
    firestoreFuncs.getAPIPair(workspace)
    .then( res => {
      return handleWorkspacePairup(workspace, res);
    }).catch(err => console.error(err));
  }, 3000 * i)
}
async function handleWorkspacePairup(workspace, apiPair){
        if(apiPair !== null){
          const botToken = apiPair.botToken;
          try{
            const pairUpResult = pairUp.pairUp(undefined, botToken);
            // console.log("Paired up workspace " + workspace)
            return pairUpResult;
          }catch(error){
            console.error("Could not schedule pair up for workspace " + workspace +
            ". This may be because the pairing channel might not be set up in firestore.")
          }

        }
        else{
          console.error("Could not schedule pair up for workspace " + workspace +
                        " because the api pair is not stored in firestore.")
        }
        return Promise.resolve();
}
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
  /*
  for (var w of workspaces) {
    console.log("Workspace: " + w);
    var p = scheduleDailyWorkspace(w);
    
  }
  */
  scheduleDailyWorkspace("T012US11G4X");
  return null;
}

// Helper function for scheduleDailyHelper
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

// Helper function for scheduleDailyWorkspace
async function scheduleDailyUser(workspaceId, userId, token, day) {
  day = "Monday";
  console.log("user: " + userId);
  let pairingData = await firestoreFuncs.getUserPairingData(workspaceId, userId);
  let warmupTime = await firestoreFuncs.getWarmupTime(workspaceId, userId, day);
  let cooldownTime = await firestoreFuncs.getCooldownTime(workspaceId, userId, day);

  if (!pairingData || !warmupTime || !cooldownTime) {
    console.log("Incomplete user data");
    return null;
  }

  var warmupTask;
  var cooldownTask;
  var dmThreadID = pairingData.dmThreadID;

  if (day === "Monday") {
    //TODO generate hardcoded tasks for monday quote and retrospective
    warmupTask = null;
    cooldownTask = null;
  }
  else {
    warmupTask = pairingData.warmupTask;
    cooldownTask = pairingData.cooldownTask;
  }

  //TODO if no such warmup or cooldown make one for testing
  if (!warmupTask) {
    // add
  }
  if (!cooldownTask) {
    // add
  }

  console.log(warmupTime);
  console.log(cooldownTime);
  console.log(pairingData);

  if (dmThreadID) {
    var hour, min, mid;

    split = warmupTime.split(" ");
    hour = warmupTime.split(" ")[0].split(":")[0];
    min = warmupTime.split(" ")[0].split(":")[1];
    mid = warmupTime.split(" ")[1];
    if (mid === "PM") {
      hour = String(Number(hour) + 12);
    }
    console.log(hour);
    console.log(min);
    console.log(mid);

    schedule.scheduleMsg(hour, min, warmupTask, dmThreadID, token);
    

    split = cooldownTime.split(" ");
    hour = cooldownTime.split(" ")[0].split(":")[0];
    min = cooldownTime.split(" ")[0].split(":")[1];
    mid = cooldownTime.split(" ")[1];

    if (mid === "PM") {
      hour = String(Number(hour) + 12);
    }
    console.log(hour);
    console.log(min);
    console.log(mid);

    schedule.scheduleMsg(hour, min, cooldownTask, dmThreadID, token);
  }

  return null;
}