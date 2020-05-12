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

const firestoreFuncs = require('./firestore');


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
    firestoreFuncs.firestoreTest();
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
   warmupMessage.requestCustomSend(ack,body,context);
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
	warmupMessage.customMsgView(ack, body, view, context);
});


async function writeToDB(teamId, userID, channelID,msgToSend,isWarmup) {
	admin.firestore().collection("workspaces").doc(teamId+"/activeChannels/"+channelID+"/teammatePairings/"+userID).set({
		warmupMessage: msgToSend
	});

}

