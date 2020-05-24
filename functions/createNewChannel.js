const index = require('./index');
const app = index.getBolt();
const appHome = require('./appHome');
const firestoreFuncs = require('./firestore');

// create button - action listener
app.action('new_channel_button', async({ack, body, context}) => {
    ack();
    console.log("DISPLAYING MODAL...");
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
    const valuesObject = view['state']['values']; // get a reference to the view object's values
    const newChannelName = valuesObject['write_name']['input_text']['value'];
    console.log(newChannelName);
    // create new channel with newChannelName
});

// if (hasInvalidChars(newChannelName)) {
//     app.view('new_modal', async ({ ack, body, view, context }) => {
//         ack({
//             "response_action": "errors",
//             "errors": {
//                 "write_name": "A channel name may only contain lowercase letters, numbers, hyphens, and underscores."
//         }
//         });
//     });
// }

// handling errors
// if (hasInvalidChars(newChannelName)) {
//     app.view('new_modal', async ({ ack, body, view, context }) => {
//         ack({
//             "response_action": "errors",
//             "errors": {
//                 "write_name": "A channel name may only contain lowercase letters, numbers, hyphens, and underscores."
//         }
//         });
//     });
// } else if (newChannelName.length() > 80) {
//     app.view('new_modal', async ({ ack, body, view, context }) => {
//         ack({
//             "response_action": "errors",
//             "errors": {
//                 "write_name": "A channel name must be 80 or fewer characters."
//             }
//         });
//     });
// } else if (isSlackWord(newChannelName)) {
//     app.view('new_modal', async ({ ack, body, view, context }) => {
//         ack({
//             "response_action": "errors",
//             "errors": {
//                 "write_name": "Slack will not allow this channel name."
//             }
//         });
//     });
// } else if (isAnExistingChannel(newChannelName)) { 
//     app.view('new_modal', async ({ ack, body, view, context }) => {
//         ack({
//             "response_action": "errors",
//             "errors": {
//                 "write_name": "A channel with this name already exists!"
//             }
//         });
//     });
// } else { // input is valid
//     app.view('new_modal', async ({ ack, body, view, context }) => {
//         ack();
//     });
// }

// Check if channel already exists
function isAnExistingChannel(channel) {
    const conversations = app.client.conversations.list({
        token:token
    });
    if (conversations.includes(channel)) {
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