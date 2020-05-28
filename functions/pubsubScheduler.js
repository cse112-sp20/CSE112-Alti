const index = require('./index');
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const warmupMessage = require('./warmupMessage');
const generateTaskData = require('./generateTaskData');
const app = index.getBolt();

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// class variable to track dmThreads where prompts have already been sent
var threads = [];

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
  threads = [];
  
  for (var w of workspaces) {
    var p = scheduleDailyWorkspace(w);
    
  }
  
  // TESTING PURPOSES
  // scheduleDailyWorkspace("T012US11G4X");
  return null;
}

// Helper function for scheduleDailyHelper- Iterate through single workspace
async function scheduleDailyWorkspace(workspaceId) {
  var d = new Date();
  var n = d.getDay();
  if (n < 1 || n > 5) {
    return;
  }
  var day = days[n];
  console.log("Day: " + day);

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
  let convoObj = await app.client.conversations.members({
    token: w_token,
    channel: channel
  }).catch((error) => {
    console.error(error);
  });

  let memberList = convoObj.members;
  for (var m of memberList) {
    scheduleDailyUser(workspaceId, m, w_token, day, threads);
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
  // day = "Monday";
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
  var quote;

  if (day === "Monday") {
    //TODO generate hardcoded tasks for monday quote and retrospective
    quote = generateTaskData.generateQuote();
    quote = quote.split("-")[1] + "-" + quote.split("-")[2];
    warmupTask = `Your partner sent you a motivational quote to help you start your day right!\n${quote}`;
    cooldownTask = `Retrospective question for <@${  userId  }>`;
  }
  else {
    warmupTask = pairingData.warmupTask;
    cooldownTask = pairingData.cooldownTask;
  }

  //if no such warmup or cooldown make one for testing
  /*
  if (!warmupTask) {
    quote = generateTaskData.generateQuote();
    quote = quote.split("-")[1] + "-" + quote.split("-")[2];
    warmupTask = `Your partner sent you a motivational quote to help you start your day right!\n${quote}`;
  }
  if (!cooldownTask) {
    cooldownTask = `Retrospective question for <@${  userId  }>`;
  }
  console.log(warmupTime);
  console.log(cooldownTime);
  console.log(pairingData);
  */

  if (dmThreadID) {
    var hour, min, mid;

    if (warmupTask) {

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

      console.log("Schedule warm up message for " + hour + ":" + min);
      await schedule.scheduleMsg(hour, min, warmupTask, dmThreadID, token).catch((error) => {
        console.log(error);
      }); 

      // TESTING PURPOSES
      // schedule.scheduleMsg(21, 27, warmupTask, dmThreadID, token);
    }
    else {
      console.log("No warmup task");
    }

    if (cooldownTask) {
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

      console.log("Schedule cooldown message for " + hour + ":" + min);
      await schedule.scheduleMsg(hour, min, cooldownTask, dmThreadID, token).catch((error) => {
        console.log(error);
      });

      // TESTING PURPOSES
      // await schedule.scheduleMsg(16, 36, cooldownTask, dmThreadID, token);
    }
    else {
      console.log("No cooldown task");
    }

		if (day !== 'Friday' && !threads.includes(dmThreadID)) {
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

      threads.push(dmThreadID);
      
      console.log("Schedule prompts for "+ hour + ":" + min);
			await schedule.scheduleWarmupChoice(hour, min, dmThreadID, token).catch((error) => {
        console.log(error);
      });
      await schedule.scheduleCooldownChoice(hour, min, dmThreadID, token).catch((error) => {
        console.log(error);
      });
      
      // TESTING PURPOSES
      //await schedule.scheduleWarmupChoice(16, 36, dmThreadID, token);
      //schedule.scheduleCooldownChoice(16, 36, dmThreadID, token);
    }
    else {
      console.log("Prompting not run");
    }
  }

  return null;
}