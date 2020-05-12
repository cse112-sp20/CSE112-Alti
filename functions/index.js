const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;

<<<<<<< HEAD
const pairUp = require('./pairUp');
=======
const schedule = require('./schedule');
>>>>>>> 87f68af118e41a629baf1523a0175931b1236f1f
const onBoard = require('./onBoard');
const appHome = require('./appHome');
const bot_token = config.slack.bot_token;

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

const warmupMessage = require('./warmupMessage');
const pubsubScheduler = require('./pubsubScheduler')
const pairUp = require('./pairUp');
exports.scheduledPairUp = pubsubScheduler.scheduledPairUp;
exports.scheduleWarmup = pubsubScheduler.scheduleWarmup;

// Global error handler
app.error(console.log);


app.command('/pairup', async ({ command, ack, say }) => {
    // Acknowledge command request

    ack();
    say(`Trying to pair up.`);
    pairUp.pairUp("general");

});

// app.command('/warmup', async({command, ack, say}) => {
//     ack();
//     say(`Trying to schedule a warmup`);
//     //let hour = parseInt(command.text.split(" ")[0])
//     //let minute = parseInt(command.text.split(" ")[1])
//     //schedule.warmup(app, bot_token, hour , minute); 
// });


app.message(async ({ message, context }) => {
    try{
        if(message.channel_type === 'im'){
            console.log("Message object: ");
            console.log(message);
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


// Listen to the app_home_opened Events API event to hear when a user opens your app from the sidebar
app.event("app_home_opened", async ({ payload, context }) => {
    appHome.appHome(app, payload, context);
});

app.command('/setup', async ({payload, ack, say }) => {
    ack();
    say("Trying to set up");
    onBoard.onBoard(app, bot_token, payload.team_id, "alti-pairing");

});

app.action('select', async({payload, ack, say}) => {
    ack();
    // block action payload type
    var team_info = await app.client.team.info({
        token: bot_token
    }).catch((error) => {
        console.log(error);
    });
    var team_id = team_info.team.id;
    onBoard.onBoardExisting(app, bot_token, team_id, payload.selected_channel);
});

