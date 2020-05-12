const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const bot_token = config.slack.bot_token;
const warmupMessage = require('./warmupMessage');

admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const expressReceiver = new ExpressReceiver({
    signingSecret: signingSecret,
    endpoints: '/events',
});

const app = new App({
    receiver: expressReceiver,
    token: bot_token
});

exports.getBolt = function getBolt(){
    return {
        app:app,
        token:bot_token
    }
};

const pubsubScheduler = require('./pubsubScheduler')
exports.scheduledPairUp = pubsubScheduler.scheduledPairUp;


// Global error handler
app.error(console.log);

// Handle `/echo` command invocations
app.command('/pairup', async ({ command, ack, say }) => {
    // Acknowledge command request

    ack();
    say(`Trying to pair up.`);
    pairUp.pairUp(app, bot_token, "general");

});

app.command('/warmup', async({command, ack, say}) => {

    ack();
    say(`Trying to schedule a warmup at 9am`);
    schedule.warmup(app, token); 
    //schedule.show(app, token); //doesnt work yet. Check the code. 
});

app.message(async ({ message, context }) => {
    try{
        if(message.channel_type === 'im'){
            app.client.chat.postMessage({
                token: bot_token,
                channel: '#general',
                text: `<@${message.user}> just DMd me. What a creep?! Other people should also know that "${message.text}"`
            });
        }
    }
    catch(error){
        console.error(error);
    }

});
exports.slack = functions.https.onRequest(expressReceiver.app);

app.command('/firestore', async ({ command, ack, say }) => {	
    // Acknowledge command request	

    ack();	
    let docRef = db.collection('Workspaces').doc('T0132EDC3M4').get().then((doc) => {	
            if (!(doc && doc.exists)) {	
                return console.log({ error: 'Unable to find the document' });	
            }	
            return say(String(doc.data().users));	
        }).catch((err) => {	
            return console.log('Error getting documents', err);	
        });	
    say(`Trying to firebase`);	


}); 

// Handle '/setupWarmup` command invocations
app.command('/setupwarmup', async ({ command, ack, say }) => {
    // Acknowledge command request
    ack();
	//send Warmup prompts to the channel that this command was called from
    warmupMessage.sendSelectChoice(command.channel_id,app,bot_token);
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
request_custom_send Action Listener
Descr: Listens for a slack provided action id matching 
'request_custom_send' and opens a model for sending a custom message
in the user's from where the action originated from window with a 
model for sending a custom message
return:
na
*/
app.action('request_custom_send', async ({ ack, body, context }) => {
    await ack();
	console.log(body.channel.id);
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
				block_id: body.channel.id,
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
  // get a  reference to the view object's values
  const valuesObject = view['state']['values']
  let msgToSend = ''
  let counter = 0;
  let channelID = "";
  //obtain the first key in the values object and use it to grab the user input 
  //as well as the channel the user wants to send the input to
  for (key in valuesObject) {
	  if (counter === 0) {
		msgToSend += valuesObject[key]['input_text']['value'];
		counter++;
		channelID=key;
	  }
  }
  //gets teamID from the action which functions as workspace id
  const teamID = body['team']['id'];
  //gets the userID from the action
  const userID = body['user']['id'];
  //console.log used for local testing
  console.log(userID + " in " + channelID + " sent the following: " + msgToSend+ "in team:"+ teamID);
  //writes the data collected to the firebase
  writeToDB(teamID, userID, channelID,msgToSend,true);
});


async function writeToDB(teamId, userID, channelID,msgToSend,isWarmup) {
	if (isWarmup === true) {
		admin.firestore().collection("workspaces").doc(teamId+"/activeChannels/"+channelID+"/teammatePairings/"+userID).set({
			warmupMessage: msgToSend
		});
	}
	else {
		admin.firestore().collection("workspaces").doc(teamId+"/activeChannels/"+channelID+"/teammatePairings/"+userID).set({
			cooldownMessage: msgToSend
		});
	}
}






