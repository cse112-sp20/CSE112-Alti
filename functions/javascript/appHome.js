const index = require('./index');
const app = index.getBolt();

const appHomeObjects = require('./appHomeObjects');
const firestoreFuncs = require('./firestore');
const leaderboard = require('./leaderboard');

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Listen to the app_home_opened Events API event to hear when a user opens your app from the sidebar
app.event("app_home_opened", async ({ body, context }) => {
  console.log("It's running");
  appHome(app, body, context);
});

app.action("selectOwner", async({body, ack, context}) => {
  ack();
  setOwner(app, body, context);
});

async function updateAppHome(userId, team_id, context) {
  var payload = {};
  payload.event = {};
  payload.event.user = userId;
  payload.team_id = team_id;
  appHome(app, payload, context);
}

// appHome return the json object creating the application's home page
exports.appHome = appHome;
async function appHome(app, payload, context) {
  console.log("appHome triggered");
  try {
		const userId = payload.event.user;
		const workspaceID = payload.team_id;
		var view = await loadHomeTabUI(app, workspaceID, userId, context);
    // Call the views.publish method using the built-in WebClient
    const result = await app.client.views.publish({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      user_id: userId,
      view: view
    });
  }
  catch (error) {
    console.error(error);
  }
}

/* Checks if the user that has opened the home tab is the "owner" of Alti in this workspace
*/
async function checkOwner(workspaceID, userId) {
	//console.log(workspaceID);
	if (userId === undefined) {
		return true;
	}
	var ownerID = await firestoreFuncs.getOwner(workspaceID).then((obj)=>{
		return obj;
	}).catch((error) => {
        console.log(error);
	});
	
	if(typeof(ownerID) === "undefined") {
		return true;
	}
	else {
		if(ownerID === userId) {
			return true;
		}
		else {
			return false;
		}
	}
}

function getAllTimes(workspaceId, userId) {
  var results = [];
  for (var day of days) {
    results.push(firestoreFuncs.getWarmupTime(workspaceId, userId, day));
    results.push(firestoreFuncs.getCooldownTime(workspaceId, userId, day));
  }
  return Promise.all(results);
}

// returns a dictionary of section blocks containing mon-fri schedule
async function createScheduleDisplay(workspaceId, userId) {
  var res = await getAllTimes(workspaceId, userId);  
  var sched = {};
  var index = 0;
  for (var day of days) {
    var block = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": day + ": " + res[index] + "-" + res[index+1]
      }
    };
    sched[day] = block;
    index += 2;
  }
  return sched;
}

/* Checks if user is owner or not and loads up either owner home tab or non-owner home tab
*/
async function loadHomeTabUI(app, workspaceID, userId, context) {

	var view;

	var ownerId = await firestoreFuncs.getOwner(workspaceID).then((obj)=>{
		return obj;
	}).catch((error) => {
        console.log(error);
	});
	
	if (ownerId === undefined) {
		firestoreFuncs.setOwner(workspaceID, userId);
	}

	var channelId = await firestoreFuncs.getPairingChannel(workspaceID).then((obj)=>{
		return obj;
	}).catch((error) => {
        console.log(error);
  	});

  var channelName;
  if (typeof(channelId) !== "undefined") {
    channelName = await app.client.conversations.info({
      token: context.botToken,
      channel: channelId
    }).then((obj)=>{
      return obj.channel.name;
    }).catch((error) => {
      console.log(error);
    });
  }
  else {
    channelName = "None";
  }

  var sched = await createScheduleDisplay(workspaceID, userId);
  var ownerText;
  var channelText;
  var timeZoneText;
  var partnerText;
  var partnerId;
  var dmThreadID;
  if (ownerId === undefined) {
	  ownerText = `Current Owner of Alti is...there is no current owner of Alti! :scream: You can easily set an owner in the *Pick a folk* section.`;
  }
  else {
	  ownerText = `Current Owner of Alti is <@${  ownerId  }>, you can ask the owner for changing paring channel of the team.`;
  }
  if (channelId === undefined) {
	  channelText = `You have not picked a pairing channel yet 😟. If you're the Atli admin, choose or create one below to get started!`;
	  partnerText = `There's no pairing channel selected, so no pairings have been made 😢. The Alti admin needs to select a pairing channel to get started, and then make sure to join it!`;
  }
  else {
	  channelText = `Current Pairing Channel: #${  channelName  }`;
	  let pairingData = await firestoreFuncs.getUserPairingData(workspaceID, userId);
	  dmThreadID = pairingData === undefined ? undefined : pairingData.dmThreadID;
	  partnerId = await firestoreFuncs.getPartner(workspaceID, channelId, userId).then((obj)=>{
		return obj;
	  }).catch((error) => {
		  console.log(error);
	  });
	  console.log(partnerId);
  }

  if (partnerId === undefined) {
	partnerText = `You are not currently paired with anyone! To get paired, join the pairing channel that you see above, and wait for the next pairing cycle!`;
  } else {
	  partnerText = `Current partner:  <@${  partnerId  }>`;
  }

  //if (partnerId === undefined)


  /*
  if (timeZone === undefined) {
	  timeZoneText = `Working Time Zone: None`;
  }
  else {
	  timeZoneText = `Working Time Zone: UTC ${  timeZone  }`;
  }
  */

	// get leaderboard strings
	const leaderboards = await leaderboard.getLeaderboards(app, context.botToken, workspaceID);
	const weeklyLeaderboard = leaderboards[0];
	const monthlyLeaderboard = leaderboards[1];
	
	view = {
		"type": "home",
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `:house: *Welcome home, <@${  userId  }>*`
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "Alti pairs people up from a specific channel to help each other transition in 🌞 and out 😴 of your work days. *If you haven't yet, get started by choosing a channel to set up with* 😄"
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "👥 *Pairing Information*"
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": channelText,
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": partnerText,
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "📆 *Current Work Schedule* 🕰"
				}
			},	
			{
				"type": "divider"
			},
			{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Current schedule:"
			}
			},
			sched.Monday,
			sched.Tuesday,
			sched.Wednesday,
			sched.Thursday,
			sched.Friday,
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": ":pencil2: *Change Work Schedule* 📆"
				}
			},	
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "Pick a daily warm up time!"
				}
			},
			{
				"type": "actions",
				"block_id": "warm up block",
				"elements": [
					{
					"type": "static_select",
					"action_id": "warmup_time1_selected",
					"placeholder": {
						"type": "plain_text",
						"text": "Select a time",
						"emoji": true
					},
					"options": appHomeObjects.times
					},
					{
					"type": "static_select",
					"action_id": "warmup_time2_selected",
					"placeholder": {
						"type": "plain_text",
						"text": "AM/PM",
						"emoji": true
					},
					"options": appHomeObjects.ampm
					},
					{
					"type":"button",
					"action_id":"warmup_time_set_button",
					"text":{
						"type":"plain_text",
						"text":"set",
						"emoji":true
					}
					},
				]
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "Pick a daily cooldown time!"
				}
			},
			{
				"type": "actions",
				"block_id": "cooldown block",
				"elements": [
					
					{
					"type": "static_select",
					"action_id": "cooldown_time1_selected",
					"placeholder": {
						"type": "plain_text",
						"text": "Select a time",
						"emoji": true
					},
					"options": appHomeObjects.times
					},
					{
					"type": "static_select",
					"action_id": "cooldown_time2_selected",
					"placeholder": {
						"type": "plain_text",
						"text": "AM/PM",
						"emoji": true
					},
					"options": appHomeObjects.ampm
					},
					{
					"type":"button",
					"action_id":"cooldown_time_set_button",
					"text":{
						"type":"plain_text",
						"text":"set",
						"emoji":true
					}
					},
				]
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "or... set custom times for each day!"
				},
				"accessory": {
					"type":"button",
					"action_id": "set_custom_times",
					"text":{
						"type":"plain_text",
						"text":"Customize",
						"emoji":true
					}
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "🏆 *Leaderboard* 🏅"
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text":
				{
					"type": "mrkdwn",
					"text": weeklyLeaderboard
				}
			},
			{
				"type": "section",
				"text":
				{
					"type": "mrkdwn",
					"text": monthlyLeaderboard
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			},
			{
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			}
		]
	};
	if (await checkOwner(workspaceID, userId)) {
		// Add admin zone header
		view.blocks.splice(6, 0, {
			"type": "section",
			"text":
			{
				"type": "mrkdwn",
				"text": "👔 *Admin Zone*"
			}
		});

		// Add divider
		view.blocks.splice(7, 0, { "type": "divider" });
		
		// Add pick pairing channel under admin zone
		view.blocks.splice(8, 0, {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "👉 *Pick a channel* to add me to and I'll introduce myself and start pairing people up. I'm usually added to a team or project channel."
			},
			"accessory": {
				"action_id": "pairing_channel_selected",
				"type": "channels_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select a channel...",
					"emoji": true
				},
				"confirm": 
					{
						"title": {
							"type": "plain_text",
							"text": "Are you sure?"
						},
						"text": {
							"type": "plain_text",
							"text": "❗️*NOTE*❗️: Switching pairing channel will remove all data previously associated with that channel. Also, users that were in the previous pairing-channel will not be transferred over to the new one, they will have to manually join that new channel"
						},
						"confirm": {
							"type": "plain_text",
							"text": "Do it"
						},
						"deny": {
							"type": "plain_text",
							"text": "Stop, I've changed my mind!"
						}
					}
			}
		});
		
		// Add create new pairing channel button under Admin Zone
		view.blocks.splice(9, 0, {
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "Or, *create a new pairing channel*. "
				},
				"accessory": {
					"type": "button",
					"action_id": "new_channel_button",
					"text": {
						"type": "plain_text",
						"text": "Create",
						"emoji": true
					}
				}
		});

		view.blocks.splice(10, 0, {
			"type": "section", // spacing
			"text": {
				"type": "mrkdwn",
				"text": " "
			}
		});

		// Add choose another admin under Admin Zone
		view.blocks.splice(11, 0, {
			"type": "section",
			"block_id": "section678",
			"text": {
				"type": "mrkdwn",
				"text": "🤝 *Pick a folk* to be the leader of Alti. The leader can pick pairing channel of the workspace"
			},
			"accessory": {
				"action_id": "selectOwner",
				"type": "users_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select a folk..."
				},
				"confirm": {
					"title": {
						"type": "plain_text",
						"text": "Are you sure?"
					},
					"text": {
						"type": "plain_text",
						"text": "Designate this as the team leader?"
					},
					"confirm": {
						"type": "plain_text",
						"text": "Do it"
					},
					"deny": {
						"type": "plain_text",
						"text": "Stop, I've changed my mind!"
					}
				}
			}
		});

		// Add 4 spacing blocks
		for (var i = 0; i < 4; i++) {
			view.blocks.splice(12 + i, 0, {
				"type": "section", // spacing
				"text": {
					"type": "mrkdwn",
					"text": " "
				}
			});
		}
	}

	return view;
}

async function setOwner(app, body, context){
  firestoreFuncs.setOwner(body.team.id, body.actions[0].selected_user);
  updateAppHome(body.user.id, body.team.id, context);
}
exports.setOwner = setOwner;
exports.updateAppHome = updateAppHome;
exports.getAllTimes = getAllTimes;
exports.checkOwner = checkOwner;
