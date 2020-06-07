const index = require('./index');
const app = index.getBolt();
const firestoreFuncs = require('./firestore');

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var channelNames = [];

// ACTION listener - create button
app.action('new_channel_button', async({ack, body, context}) => {
    ack();
    app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: new_channel_modal
    }).catch((error) => {
        console.log(error);
    });
    getChannelNames(context.botToken);
});

// VIEW listener - modal
app.view('new_modal', async ({ ack, body, view, context }) => {
    const valuesObject = view['state']['values'];
    const newChannelName = valuesObject['write_name']['input_text']['value'];
    const errors = {};
    if (hasInvalidChars(newChannelName))
        errors['write_name'] = "A channel name can only contain lowercase letters, numbers, hyphens, and underscores";
    else if (isOnlyPunctuation(newChannelName))
        errors['write_name'] = "A channel name cannot contain only punctuation";
    else if (newChannelName.length > 80)
        errors['write_name'] = "A channel name must be fewer than 80 characters";
    else if (isSlackWord(newChannelName))
        errors['write_name'] = "Slack does not allow channels to have this name";
    else if (isAnExistingChannel(newChannelName))
        errors['write_name'] = "A channel with this name already exists!";

    if (Object.entries(errors).length > 0) {
        ack({
            response_action: 'errors',
            errors: errors
        });
    } else {
        ack();
        await createNewPairingChannel(app, context.botToken, body.team.id, newChannelName);
    }
});

// Creates a new pairing channel
async function createNewPairingChannel(app, token, team_id, channelName) {
    try {
        var promises = [];

        // get owner id
        var ownerId = await firestoreFuncs.getOwner(team_id).then((obj)=>{
            return obj;
        }).catch((error) => {
            console.log(error);
        });

        // create channel
        var conversationObj = await app.client.conversations.create({
            token: token,
            name: channelName
        }).catch((error) => {

            console.log(error);
        });

        // invite owner to channel
        app.client.conversations.invite({
            token: token, 
            channel: conversationObj.channel.id,
            users: ownerId
        }).catch((error) => {
            console.log(error);
        });

        let welcomeMessage = "Hi everyone! 😄 My name is Alti and I just got added to this channel to make sure everyone in here gets paired up every week!\n\nIf you don't want to be paired up next week, you can simply leave this channel.";
        // send welcome message
        app.client.chat.postMessage({
            token: token,
            channel: conversationObj.channel.id,
            text: welcomeMessage
        });

        // store new channel in firestore
        promises.push(firestoreFuncs.storeNewPairingChannel(team_id, conversationObj.channel.id));
        
        // store default times for owner in firestore
        for (var day of days) {
            promises.push(firestoreFuncs.setWarmupTime(team_id, ownerId, "9:00 AM", day));
            promises.push(firestoreFuncs.setCooldownTime(team_id, ownerId, "5:00 PM", day));
        }
        Promise.all(promises).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

// FOR ERROR CHECKING

// Check if name contains invalid characters
function hasInvalidChars(name) {
    if (name.match(/[^a-z0-9\-_]/)) {
        return true;
    }
    else { 
        return false; 
    }
}

// Check if name contains only punctuation
function isOnlyPunctuation(name) {
    if (name.match(/[^\-_]/)) {
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

// Check if channel already exists
function isAnExistingChannel(name) {   
    if (channelNames.includes(name)) {
        return true;
    } else {
        return false;
    }
}

// Get channel names (not IDs) and store them in channelNames
async function getChannelNames(token) {
    var channels = await app.client.conversations.list({
        token: token
    }).catch((error) => {
        console.log(error);
    }).then((obj) => {
        return obj.channels;
    }).then((channels) => {
        for (var i = 0; i < Object.keys(channels).length; i++) {
            channelNames.push(channels[i].name);
        }
        return channelNames;
    });
}
    
// Modal for creating a new channel
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
                "action_id": "input_text",
                "placeholder": {
					"type": "plain_text",
					"text": "alti-pairing",
				},
			}
		}
	]
};