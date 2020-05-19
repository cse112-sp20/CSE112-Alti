const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;
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
const onBoard = require('./onBoard');
const appHome = require('./appHome');
const appHomeSchedule = require('./appHomeSchedule');
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
	warmupMessage.customMsgView(ack, body, view, context,true);
});


// Handle '/setupWarmup` command invocations
app.command('/setupcooldown', async ({ command, ack, say }) => {
    // Acknowledge command request
    ack();
	//send Warmup prompts to the channel that this command was called from
    warmupMessage.sendSelectCooldownChoice(command.channel_id,app,bot_token);
});

app.action('cooldown_video_select', async ({ ack, body, context }) => {
   warmupMessage.cooldownVideoSelect(ack,body,context);
 });
 
app.action('cooldown_article_select', async ({ ack, body, context }) => {
   warmupMessage.cooldownArticleSelect(ack,body,context);
 });

app.action('cooldown_retro_select', async ({ ack, body, context }) => {
   warmupMessage.cooldownRetroSelect(ack,body,context);
 });
 
app.action('cooldown_custom_select', async ({ ack, body, context }) => {
   warmupMessage.requestCustomSendCooldown(ack,body,context);
 });
 
app.view('custom_msg_view_cooldown', async ({ ack, body, view, context }) => {
	warmupMessage.customMsgView(ack, body, view, context,false);
});
 
app.action('warmup_coding_select', async ({ ack, body, context }) => {
   warmupMessage.warmupCodingSelect(ack,body,context);
 });
 
 app.action('warmup_article_select', async ({ ack, body, context }) => {
   warmupMessage.warmupArticleSelect(ack,body,context);
 });

app.action('warmup_puzzle_select', async ({ ack, body, context }) => {
   warmupMessage.warmupPuzzleSelect(ack,body,context);
 });

app.action('warmup_quote_select', async ({ ack, body, context }) => {
   warmupMessage.warmupQuoteSelect(ack,body,context);
 });


 
 app.view('generic_close', async ({ ack, body, context }) => {
    ack({
	  //clear the modal off the users screen
	 "response_action": "clear"
  });
 });
  
 app.action('generic_ack', async ({ ack, body, context }) => {
    ack();
 });
 

