const index = require('./index');
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const warmupMessage = require('./warmupMessage');
const app = index.getBolt();

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// class variable to track dmThreads where prompts have already been sent
var threads;
var test = 0;
/* Scheduling Idea:
/ Pair everyone up on Sundays but only create and send the thread on earliest partner's workday start
/ on Monday. 
/ For Mondays, always send a quote in the intro DM as warmup and retro question as cooldown.
/ On other weekdays, send each person their warmup in the morning, cooldown in the evening, and
/ prompt for their warmup and cooldown selection for their partner in the evening too.
/ (Morning = start of workday, Evening = end of workday)
*/

exports.scheduledPairUp = functions.pubsub
														.schedule('every sunday 13:00')
														.timeZone('America/Los_Angeles')
														.onRun(async (context) =>  {

  const allWorkspaces = await firestoreFuncs.getAllWorkspaces();
  // allWorkspaces.push("T0132EDC3M4");
  // console.log(allWorkspaces);
  let promise = Promise.resolve();
  // console.log(allWorkspaces);
	for( i=0; i<allWorkspaces.length; i++){
    let workspace = allWorkspaces[i];
		// if ( workspace !== "T011H6FAPV4" ){
      // console.log("AT: " + workspace);
      promise = promise.then(res => {
        return firestoreFuncs.getAPIPair(workspace);
      },rej => {
        return firestoreFuncs.getAPIPair(workspace);
      });
      promise = promise.then(res => {
        return handleWorkspacePairup(workspace, res)
      });
    // }
  }
  promise.catch(err => console.error(err));
  await promise;
});

async function handleWorkspacePairup(workspace, apiPair){
				if(apiPair !== null){
					const botToken = apiPair.botToken;
					try{
						const pairUpResult = await pairUp.pairUp(undefined, botToken);
						console.log("Paired up workspace " + workspace)
						return Promise.resolve();
					}catch(error){
						console.error("Could not schedule pair up for workspace " + workspace +
						". This may be because the pairing channel might not be set up in firestore.")
					}

				}
				else{
					console.error("Could not schedule pair up for workspace " + workspace +
												" because the api pair is not stored in firestore.")
				}
				return Promise.reject(new Error("Workspace "+workspace+" has not been paired"));
}

exports.scheduleDaily = functions.pubsub
													.schedule('every mon,tue,wed,thu,fri 00:10')
													.timeZone('America/Los_Angeles')
													.onRun((context) => {
		// Look through workspace's users in db and schedule warmup for each user
		scheduleDailyHelper();

});

// Helper function for scheduleDaily- Iterate through workspaces
async function scheduleDailyHelper() {
  let workspaces = await firestoreFuncs.getAllWorkspaces();
  threads = {};
  
  if (test === 0) {
    for (var w of workspaces) {
      var p = scheduleDailyWorkspace(w);
    }
  }
  else {
  // TESTING PURPOSES
     scheduleDailyWorkspace("T012US11G4X");
    //scheduleDailyWorkspace("T011H6FAPV4");
    //scheduleDailyWorkspace("T0132EDC3M4");

  }
  return null;
}

/* Helper method to build threads object
 / Dict of objects where each object a thread and an object of 
 / earliest warmup time and cooldown time
 / threads = { G0146LGD4TV: { warmupTime: '7:00 AM', 
                              cooldownTime: '5:00 PM',
                              warmupUser: 'U0', 
                              cooldownUser: 'U1' } }
 */
async function addToThreads(workspaceId, memberList, token, threads, day) {
  var promises = [];
  for (var mem of memberList) {
    promises.push(addUserToThreads(workspaceId, mem, token, threads, day));
  }
  return Promise.all(promises);
}
async function addUserToThreads(workspaceId, userId, token, threads, day) {
  let pairingData = await firestoreFuncs.getUserPairingData(workspaceId, userId);
  if (!pairingData || !pairingData.dmThreadID) {
    console.log(userId + " has no user id");
    return;
  }
  let warmupTime = await firestoreFuncs.getWarmupTime(workspaceId, userId, day);
  let cooldownTime = await firestoreFuncs.getCooldownTime(workspaceId, userId, day);
  if (!warmupTime) {
    return;
  }
  if (!cooldownTime) {
    return;
  }
  var dmThreadID = pairingData.dmThreadID;
  if (dmThreadID in threads) {
    // normal vars are current in object, 2's are the current user we are looking at
    var hour, min, mid, hour2, min2, mid2;
    hour = Number(threads[dmThreadID].cooldownTime.split(" ")[0].split(":")[0]);
    min = Number(threads[dmThreadID].cooldownTime.split(" ")[0].split(":")[1]);
    mid = threads[dmThreadID].cooldownTime.split(" ")[1];
    hour2 = Number(cooldownTime.split(" ")[0].split(":")[0]);
    min2 = Number(cooldownTime.split(" ")[0].split(":")[1]);
    mid2 = cooldownTime.split(" ")[1];

    if (mid2 === "AM" && mid === "PM") {
      threads[dmThreadID].cooldownUser = userId;
      threads[dmThreadID].cooldownTime = cooldownTime;
    }
    else if (mid2 === mid) {
      if (hour2 < hour && hour !== 12) {
        threads[dmThreadID].cooldownUser = userId;
        threads[dmThreadID].cooldownTime = cooldownTime;
      }
      else if (hour === hour2) {
        if (min2 < min) {
          threads[dmThreadID].cooldownUser = userId;
          threads[dmThreadID].cooldownTime = cooldownTime;
        }
      }
      else if (hour2 > hour && hour2 === 12) {
        threads[dmThreadID].cooldownUser = userId;
        threads[dmThreadID].cooldownTime = cooldownTime;
      }
    }

    // normal vars are current in object, 2's are the current user we are looking at
    hour = Number(threads[dmThreadID].warmupTime.split(" ")[0].split(":")[0]);
    min = Number(threads[dmThreadID].warmupTime.split(" ")[0].split(":")[1]);
    mid = threads[dmThreadID].warmupTime.split(" ")[1];
    hour2 = Number(warmupTime.split(" ")[0].split(":")[0]);
    min2 = Number(warmupTime.split(" ")[0].split(":")[1]);
    mid2 = warmupTime.split(" ")[1];

    if (mid2 === "AM" && mid === "PM") {
      threads[dmThreadID].warmupUser = userId;
      threads[dmThreadID].warmupTime = warmupTime;
    }
    else if (mid2 === mid) {
      if (hour2 < hour && hour !== 12) {
        threads[dmThreadID].warmupUser = userId;
        threads[dmThreadID].warmupTime = warmupTime;
      }
      else if (hour === hour2) {
        if (min2 < min) {
          threads[dmThreadID].warmupUser = userId;
          threads[dmThreadID].warmupTime = warmupTime;
        }
      }
      else if (hour2 > hour && hour2 === 12) {
        threads[dmThreadID].warmupUser = userId;
        threads[dmThreadID].warmupTime = warmupTime;
      }
    }

  }
  else {
    threads[dmThreadID] = {cooldownUser: userId, 
                          warmupUser: userId, 
                          cooldownTime: cooldownTime,
                          warmupTime: warmupTime }; 
    console.log(dmThreadID + " not in threads so setting user " + userId + " as defaults" );
    return;
  }
  
}

// Helper function for scheduleDailyHelper- Iterate through single workspace
async function scheduleDailyWorkspace(workspaceId) {
  var d = new Date();
  var n = d.getDay();
  var day;
  if (test === 0) {
    if (n < 1 || n > 5) {
      return;
    }
    day = days[n];
  }
  else {
    // TESTING PURPOSES
    day = "Tuesday";
  }

  //console.log("Day: " + day);

  var keyObj = await firestoreFuncs.getAPIPair(workspaceId);
  if (!keyObj) {
    console.error("No API key");
    return;
  }
  
  var w_token = keyObj.botToken;
  if (!w_token) {
    console.error("No workspace token");
    return;
  }

  let channel = await firestoreFuncs.getPairingChannel(workspaceId);
  if (!channel) {
    console.error("No pairing channel");
    return;
  }
  else {
    // console.log("Pairing Channel: " + channel);
  }

  let memberList = [];
  let pairedUsers = await firestoreFuncs.getPairedUsers(workspaceId);
  // console.log(pairedUsers);
  pairedUsers.forEach( (obj) => {
    obj.users.forEach(member =>{
      if(!memberList.includes(member)){
        memberList.push(member);
      }
    })
  });
  // console.log("memberList: ");
  // console.log(memberList);

  // TODO make dict of threads of earliest user times
  await addToThreads(workspaceId, memberList, w_token, threads, day);
  // console.log("Threads:");
  // console.log(threads);
  for (var m of memberList) {
    scheduleDailyUser(workspaceId, m, w_token, day, threads);
  }

  if (workspaceId === "T012US11G4X") {
    var offset = new Date().getTimezoneOffset();
    app.client.chat.postMessage({
      token: w_token,
      channel: channel,
      text: "Timezone offset: " + offset + " minutes"
    });
  }
  /*
  // TESTING PURPOSES
  var temp = await app.client.chat.scheduledMessages.list({
    token: w_token,
    channel: channel
  });
  console.log("List of scheduled messages");
  console.log(temp);
  
  var l = temp.scheduled_messages;
  for (var i = 0; i < l.length; i++) {
    app.client.chat.deleteScheduledMessage({
      token: w_token,
      channel: l[i].channel_id,
      scheduled_message_id: l[i].id
    });
  }
  */
  
}

// Helper function for scheduleDailyWorkspace- Iterate through single user
async function scheduleDailyUser(workspaceId, userId, token, day, threads) {
  // TESTING PURPOSES
  // U011HDLFMCN is Eric in Alti workspace
  // Your dm thread G015C4G5PCG
  console.log("user: " + userId);
  let pairingData = await firestoreFuncs.getUserPairingData(workspaceId, userId);
  let warmupTime = await firestoreFuncs.getWarmupTime(workspaceId, userId, day);
  let cooldownTime = await firestoreFuncs.getCooldownTime(workspaceId, userId, day);
  
  if (!pairingData || !warmupTime || !cooldownTime || !pairingData.dmThreadID) {
    console.log("Incomplete user data for userId " + userId);
    return null;
  }

  var warmupTask;
  var cooldownTask;
  var dmThreadID = pairingData.dmThreadID;
  var quote;
  var hour, min, mid;

  if (userId === threads[dmThreadID].warmupUser) {
    console.log("Warmup button is being sent for user " + `<@${  userId  }>` + " in thread " + dmThreadID);

    split = warmupTime.split(" ");
    hour = warmupTime.split(" ")[0].split(":")[0];
    min = warmupTime.split(" ")[0].split(":")[1];
    mid = warmupTime.split(" ")[1];
    if (mid === "PM") {
      hour = String(Number(hour) + 12);
    }
    else if (mid === "AM" && hour === "12") {
      hour = "0";
    }

    const warmupButtonText = "Hi! Click here for your warmup! I will remind you when it's time :smile:";
    if (test === 0) { 
      console.log("Schedule warmup button for " + hour + ":" + min + " for userId " + `<@${  userId  }>`);
      await schedule.scheduleMsg(hour, min, warmupButtonText, dmThreadID, token, warmupMessage.getStartDayBlocks())
      .catch((error) => {
        console.error(error);
      }); 
    }
    else {
      // TESTING PURPOSES
      await schedule.scheduleMsg(15, 27, warmupButtonText, dmThreadID, token, warmupMessage.getStartDayBlocks())
      .catch((error) => {
        console.error(error);
      });     
    }
  }

  if (day !== 'Friday' && userId === threads[dmThreadID].cooldownUser) {
    console.log("Prompting is run for user " + `<@${  userId  }>` + " in thread " + dmThreadID);
    split = cooldownTime.split(" ");
    hour = cooldownTime.split(" ")[0].split(":")[0];
    min = cooldownTime.split(" ")[0].split(":")[1];
    mid = cooldownTime.split(" ")[1];

    if (mid === "PM" && hour !== "12") {
      hour = String(Number(hour) + 12);
    }
    else if (mid === "AM" && hour === "12") {
      hour = "0";
    }
    const exerciseSelectNotificationText = "Here is your cooldown for the day. I will remind this to you at the end of your workday!";
    if (test === 0) {
      await schedule.scheduleMsg(hour, min, exerciseSelectNotificationText, dmThreadID, token, warmupMessage.getEndDayBlocks())
              .catch((err) => {
                console.error(err);
              });
    }
    else {
      // TESTING PURPOSES
      
      await schedule.scheduleMsg(15, 27, exerciseSelectNotificationText, dmThreadID, token, warmupMessage.getEndDayBlocks())
              .catch((err) => {
                console.error(err);
              });
              
    }
  }
  else {
    console.log("Prompting not run");
  }
  return null;
}

