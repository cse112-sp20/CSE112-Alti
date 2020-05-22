const index = require('./index');
const {app, token} = index.getBolt();

const appHomeObjects = require('./appHomeObjects');
const firestoreFuncs = require('./firestore');

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Listen to the app_home_opened Events API event to hear when a user opens your app from the sidebar
app.event("app_home_opened", async ({ body, context }) => {
  console.log("It's running");
  appHome(app, body);
});

app.action("selectTimeZone", async({body, ack, context}) => {
  ack();
  setTimeZone(app, body, context);
});
app.action("selectOwner", async({body, ack, context}) => {
  ack();
  setOwner(app, body, context);
});

// Update the app home 
// TODO make this a proper func and not a hack, maybe refactor appHome parameters
async function updateAppHome(userId, team_id) {
  var payload = {};
  payload.event = {};
  payload.event.user = userId;
  payload.team_id = team_id;
  appHome(app, payload);
}

// appHome return the json object creating the application's home page
exports.appHome = appHome;
async function appHome(app, payload) {
  console.log("appHome triggered");
  try {
		const userId = payload.event.user;
		const workspaceID = payload.team_id;
		var view = await loadHomeTabUI(app, workspaceID, userId);
    // Call the views.publish method using the built-in WebClient
    const result = await app.client.views.publish({
      // The token you used to initialize your app is stored in the `context` object
      token: token,
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
async function loadHomeTabUI(app, workspaceID, userId) {
	var view;

	var ownerId = await firestoreFuncs.getOwner(workspaceID).then((obj)=>{
		return obj;
	}).catch((error) => {
        console.log(error);
	});
	console.log("Owner id: " + ownerId);
	
	if (ownerId === undefined) {
		firestoreFuncs.setOwner(workspaceID, userId);
	}

	var channelId = await firestoreFuncs.getPairingChannel(workspaceID).then((obj)=>{
		return obj;
	}).catch((error) => {
        console.log(error);
  });
  
	var timeZone = await firestoreFuncs.getTimeZone(workspaceID).then((obj)=>{
		return obj;
	}).catch((error) => {
        console.log(error);
	});
	// TODO store default LA timezome in on board file
	if (timeZone === undefined) {
		timeZone = "None";
	}

  var channelName;
  if (typeof(channelId) !== "undefined") {
    channelName = await app.client.channels.info({
      token: token,
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
  //console.log(sched);

	if(await checkOwner(workspaceID, userId)){
		view = {
			"type": "home",
			"blocks": [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `*Welcome home, <@${  userId  }> :house:*`
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "Hi there 👋 I'm Alti. I'm here to help you smoothly enter and exit your workflow! Get started by choosing a channel to set up with :)"
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `Current Pairing Channel: #${  channelName  }`,
					}
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": `Working Time Zone: UTC ${  timeZone  }`,
						"emoji": true
					}
				},
				{
					"type": "section",
					"block_id": "section678",
					"text": {
						"type": "mrkdwn",
						"text": "🤝 *Pick a folk* to be the leader of Alti. The leader can pick pairing channel or change the time zone of the workspace"
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
				},
				{
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
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "🌏 *Pick a time zone* for your workspace"
					},
					"accessory": {
						"action_id": "selectTimeZone",
						"type": "static_select",
						"placeholder": {
							"type": "plain_text",
							"text": "Select a time zone...atn",
							"emoji": true
						},
						"options": appHomeObjects.time_zones,
						"confirm": {
							"title": {
								"type": "plain_text",
								"text": "Are you sure?"
							},
							"text": {
								"type": "plain_text",
								"text": "Designate this as working time zone?"
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
				},
				{
					"type": "divider"
				},
				{
					"type": "context",
					"elements": [
						{
							"type": "mrkdwn",
							"text": "or... do `/setup` to create an #alti-pair channel with everyone in the workspace\nIf you have never set a schedule before, you'll have a default 9am to 5pm"
						}
					]
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
            "type": "divider",
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
					"type": "context",
					"elements": [
					  {
						"type": "mrkdwn",
						"text": "Pssst you gotta select a time AND am/pm"
					  }
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
						  "text":"customize",
						  "emoji":true
					  }
					}
				  },
				{
					"type": "context",
					"elements": [
						{
							"type": "mrkdwn",
							"text": "Psssst this home tab was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
						}
					]
				}
			]
		};
	}else {
		view = {
			"type": "home",
			"blocks": [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `Welcome home, <@${  userId  }> :house:`
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "Hey there 👋 I'm Alti. I'm here to help you smoothly enter and exit your workflow! Get started by choosing a channel to set up with :)"
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `Current Owner of Alti is <@${  ownerId  }>, you can ask the owner for modifying the time zone and change paring channel of the team.`
					}
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": `Warm Up Channels You're In ${  channelName  }`,
						"emoji": true
					}
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": `Working Time Zone UTC${  timeZone  }`,
						"emoji": true
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
					"type": "context",
					"elements": [
					  {
						"type": "mrkdwn",
						"text": "Pssst you gotta select a time AND am/pm"
					  }
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
						  "text":"customize",
						  "emoji":true
					  }
					}
				  },
				{
					"type": "divider"
				},
				{
					"type": "context",
					"elements": [
						{
							"type": "mrkdwn",
							"text": "Psssst this home tab was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
						}
					]
				}
			]
		};
	}

	return view;
}

async function setTimeZone(app, body, context){
  firestoreFuncs.setTimeZone(body.team.id, body.actions[0].selected_option.value);
  updateAppHome(body.user.id, body.team.id);
}
async function setOwner(app, body, context){
  firestoreFuncs.setOwner(body.team.id, body.actions[0].selected_user);
  updateAppHome(body.user.id, body.team.id);
}
exports.setTimeZone = setTimeZone;
exports.setOwner = setOwner;
exports.updateAppHome = updateAppHome;
