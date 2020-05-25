const index = require('./index');
const app = index.getBolt();
const firestoreFuncs = require('./firestore');

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// create button - action listener
app.action('new_channel_button', async({ack, body, context}) => {
    ack();
    app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: new_channel_modal
    }).catch((error) => {
        console.log(error);
    });
});

// modal - view listener
app.view('new_modal', async ({ ack, body, view, context }) => {
    ack();
    const valuesObject = view['state']['values'];
    const newChannelName = valuesObject['write_name']['input_text']['value'];
    
    // create new channel named newChannelName
    await createNewPairingChannel(app, context.botToken, body.team.id, newChannelName);
});

// Creates a new pairing channel
async function createNewPairingChannel(app, token, team_id, channelName) {
    try {
        var promises = [];
        if (!isAnExistingChannel(channelName, token) && !hasInvalidChars(channelName) && !isSlackWord(channelName)) {

            var usersDict = await findUsersWorkSpace(app, token);

            var userString = '';
            Object.keys(usersDict).forEach((u) => {
                userString += u + ',';
            });
            userString = userString.substring(0, userString.length - 1);

            // create channel
            var conversationObj = await app.client.conversations.create({
                token: token,
                name: channelName
            }).catch((error) => {
                console.log(error);
            });

            // invite people
            app.client.conversations.invite({
                token: token, 
                channel: conversationObj.channel.id,
                users: userString
            }).catch((error) => {
                console.log(error);
            });

            // send welcome message
            app.client.chat.postMessage({
                token: token,
                channel: conversationObj.channel.id,
                text: `Hi everyone! This is where we'll pair you up to participate in quick 
                        and fun warm up and cool down activities :)
                        (To opt out, just leave the channel.)`
            });

            promises.push(firestoreFuncs.storeNewPairingChannel(team_id, conversationObj.channel.id));

            for (var userId in usersDict) {
                for (var day of days) {
                    promises.push(firestoreFuncs.setWarmupTime(team_id, userId, "9:00 AM", day));
                    promises.push(firestoreFuncs.setCooldownTime(team_id, userId, "5:00 PM", day));
                }
            }
            Promise.all(promises).catch((error) => {
                console.log(error);
            });
        } else {
            console.log("Channel " + channelName + " already exists, has invalid characters, or is a slack word.");
        }
    } catch (error) {
        console.log(error);
    }
}

// Find the users within a workspace and return it as a dict of userId: userName
async function findUsersWorkSpace(app, token) {
    // find users in server
    var userMembers = await app.client.users.list({
        token: token
    }).then((obj) => {
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });
    var usersDict = {};

    userMembers.forEach((u) => {
        if (u.is_bot === false && u.name !== "slackbot") {
            var id = u.id;
            usersDict[id] = u.name;
        }
    });
    
    return usersDict;
}

// Check if channel already exists
function isAnExistingChannel(channel, token) {     
    var channels = app.client.conversations.list({
        token: token
    });
    var channelNames = [];
    for (var i = 0; i < Object.keys(channels).length; i++) {
        channelNames.push(channels[i].name);
    }
    if (channelNames.includes(channel)) {
        console.log("already exists");
        return true;
    } else {
        return false;
    }
}

// Check if name contains invalid characters
function hasInvalidChars(name) {
    if (name.match(/[^a-z0-9\-_]/)) {
        return false;
    }
    else { 
        return true; 
    }
}

// Check if name is a Slack word
function isSlackWord(name) {
    if (name === "archive" ||
        name === "archived" ||
        name === "archives" ||
        name === "all" ||
        name === "channel" ||
        name === "channels" ||
        name === "create" ||
        name === "delete" ||
        name === "deleted-channel" ||
        name === "edit" ||
        name === "group" ||
        name === "groups" ||
        name === "here" ||
        name === "me" ||
        name === "ms" ||
        name === "slack" ||
        name === "slackbot" ||
        name === "today" ||
        name === "you") {
            return true;
        } else {
            return false;
        }
}

// modal for creating a new channel
var new_channel_modal = 
{
  "type": "modal",
  "callback_id": "new_modal",
	"title": {
		"type": "plain_text",
		"text": "Create a New Channel",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Create!",
		"emoji": true
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "input",
			"block_id": "write_name",
			"label": {
				"type": "plain_text",
				"text": "What would you like to name the channel?"
			},
			"element": {
				"type": "plain_text_input",
				"action_id": 'input_text'
			}
		}
	]
};

// var success_modal =
// {
// 	"type": "modal",
// 	"title": {
// 		"type": "plain_text",
// 		"text": "New Channel Created",
// 		"emoji": true
// 	},
// 	"submit": {
// 		"type": "plain_text",
// 		"text": "Done",
// 		"emoji": true
// 	},
// 	"blocks": [
// 		{
// 			"type": "section",
// 			"text": {
// 				"type": "mrkdwn",
// 				"text": "The pairing channel has been created!"
// 			}
// 		}
// 	]
// }

// var fail_modal =


// modal - view listener - fancy, but times out
// app.view('new_modal', async ({ ack, body, view, context }) => {
//     const valuesObject = view['state']['values'];
//     const newChannelName = valuesObject['write_name']['input_text']['value'];
//     const errors = {};
//     if (newChannelName.length > 80)
//         errors['write_name'] = "A channel name must be 80 or fewer characters."
//     else if (hasInvalidChars(newChannelName))
//         errors['write_name'] = "A channel name may only contain lowercase letters, numbers, hyphens, and underscores."
//     else if (isAnExistingChannel(newChannelName))
//         errors['write_name'] = "A channel with this name already exists!"
//     else if (isSlackWord(newChannelName))
//         errors['write_name'] = "Slack will not allow this channel name."

//     if (Object.entries(errors).length > 0) {
//         ack({
//             response_action: 'errors',
//             errors: errors
//         });
//     } else {
//         ack();
//         await createNewPairingChannel(app, context.botToken, body.team_id, newChannelName);
//     }
// });