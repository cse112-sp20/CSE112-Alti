const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');
const shuffle = require('shuffle-array');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const token = config.slack.token;

admin.initializeApp();

const expressReceiver = new ExpressReceiver({
    signingSecret: signingSecret,
    endpoints: '/events'
});

const app = new App({
    receiver: expressReceiver,
    token: token
});

// Global error handler
app.error(console.log);

// Handle `/echo` command invocations
app.command('/pairup', async ({ command, ack, say }) => {
    // Acknowledge command request
    ack();
    say(`Trying to pair up.`);
    pairUp();
});


app.message(async ({ message, context }) => {
    try{
        // console.log(message)
        if(message.channel_type === 'im'){
            app.client.chat.postMessage({
                token: token,
                channel: '#general',
                text: `<@${message.user}> just DMd me. What a creep! Other people should also know that "${message.text}"`
            });
        }
    }
    catch(error){
        console.error(error);
    }

});
// Handle '/setupWarmup` command invocations
app.command('/setupwarmup', async ({ command, ack, say }) => {
    // Acknowledge command request
    ack();
	//send Warmup prompts to the channel that this command was called from
    sendSelectChoice(command.channel_id);
});

//submission responser handler
app.event('send_input', async ({ body, context, ack }) => {
	 ack();
});

/*
generic_button Action Listener
Descr: Listens for a slack provided action id matching 'generic_button'
and  acknowedlges it

return:
na
*/
app.action('generic_button', async ({ action, ack, context }) => {
     ack();
});

/*
select_user Action Listener
Descr: Listens for a slack provided action id matching 
'request_custom_send' and opens a model for sending a custom message
in the user's from where the action originated from window with a 
model for sending a custom message

return:
na
*/
app.action('request_custom_send', async ({ ack, body, context }) => {
    await ack();
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'custom_msg_view',
			title: {
			  type: 'plain_text',
			  text: 'Custom Message Warmup'
			},
			blocks: [
			  {
				type: 'input',
				block_id: body.channel_id,
				label: {
				  type: 'plain_text',
				  text: 'Enter your custom message here below.'
				},
				element: {
				  type: 'plain_text_input',
				  action_id: 'input_text',
				  multiline: true
				}
			  }
			],
			submit: {
			  type: 'plain_text',
			  text: 'Submit'
			}
		  }
      });
    }
    catch (error) {
      console.error(error);
    }
  });
 
/*
custom_msg_view view Listener
Descr: Listens for a slack provided view id matching 
'custom_msg_view' and stores a custom message submitted in this view
within firebase. 

return:
na
*/
app.view('custom_msg_view', async ({ ack, body, view, context }) => {
  // Acknowledge the custom_msg_view event
  ack({
	  //clear the modal off the users screen
	 "response_action": "clear"
  });

  // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission

  // grab the value of the input as 
  const valuesObject = view['state']['values']
  let msgToSend = ''
  let counter = 0;
  let channelID = "";
  for (key in valuesObject) {
	  if (counter == 0) {
		msgToSend += valuesObject[key]['input_text']['value'];
		counter++;
		channelID=key;
	  }
  }
  //const teamID = team['id'];
  const userId = body['user']['id'];
  //console.log(userId + " in " + channelID + " sent the following: " + msgToSend+ "in team:"+ teamID);
  //SAVE TO DB
});
  
exports.slack = functions.https.onRequest(expressReceiver.app);


/*
sendSelectChoice
Descr: Takes in a target channel id (a channel id that represents
a channel containeing two paired users and the alti bot) and sends
a string of blocks that act as a warmup selection user interface to
the channel.

args:
targChannelID (string)- an id of the target channel. 

return:
na
*/
async function sendSelectChoice(targChannelID){
	const notificationString = "Send a warmup to your buddy!"
	//warmup selection message json
	const warmupSelect = [
			{
				"type": "section",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Hey there, pick a warmup for your buddy!"
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Pick a content type:*"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Code Speed Typing Test*"
				},
				"accessory": {
					"action_id": "generic_button",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_test"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Tech Article*"
				},
				"accessory": {
					"action_id": "generic_button",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_article"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Easy Online Puzzle*"
				},
				"accessory": {
					"action_id": "generic_button",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_puzzle"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Motivational Quote*"
				},
				"accessory": {
					"action_id": "generic_button", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_quote"
				}
			},
			 {
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Custom Message*"
				},
				"accessory": {
					"action_id": "request_custom_send", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_custom"
				}
			}
		];
	//try function logic
	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.chat.postMessage({
		  // The token you used to initialize your app is stored in the `context` object
		  token: token,
		  channel: targChannelID,
		  text: notificationString,
		  blocks: warmupSelect
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}




async function pairUp(){
    try{
        const {members} = await app.client.users.list({
            token:token
        });
   
        // Get the human users among all users
        const users = Array.from(members);
        const humans = users.filter( user => {
            //SlackBot is includeded now for testing purposes, need to filter that out too.
            return !user.is_bot && user.id!=='USLACKBOT';
        });

        if(humans.length <= 1){
            console.log("Could not pair since there is less than 2 people in the workspace");
            return;
        }
        var ids = humans.map( human => human.id );

        // Randomize the order of people
        shuffle(ids);

        for (i = 0; i < ids.length/2; i++) {
            
            // var pair = new Array(ids[i], ids[i]);
            // console.log(pair);
            
            var responsePromise = app.client.conversations.open({
                token: token,
                return_im: false,
                users: ids[i]+','+ids[(ids.length/2) + i]
            })
            responsePromise.then(response => handlePairingResponse(response))
                                .catch(console.error);

        }

    }
    catch(error){
        console.error(error);
    }
}
async function handlePairingResponse(response){

    if(!response.ok){
        return console.error(response.error);
    }
    // app.client.conversations.join({
    //     token: token,
    //     channel: response.channel.id
    // });
    return app.client.chat.postMessage({
        token: token,
        channel: response.channel.id,
        text: "You ppl just got paired!"
    });
}


// const Firestore = require('@google-cloud/firestore');
// const PROJECTID = 'altitest-5f53d';
// const COLLECTION_NAME = 'Workspaces';
// const firestore = new Firestore({
//   projectId: PROJECTID,
//   timestampsInSnapshots: true,
// });


// Firestore access example:

// firestore.collection(COLLECTION_NAME)
// .doc('T0132EDC3M4')
// .get()
// .then(doc => {
//   if (!(doc && doc.exists)) {
//     console.log({ error: 'Unable to find the document' });
//   }
//   const data = doc.data();
//   console.log(data);
// }).catch(err => {
//   console.error(err);
//   console.log({ error: 'Unable to retrieve the document' });
// });