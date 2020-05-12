const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;

const pairUp = require('./pairUp');
const schedule = require('./schedule');
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




// Listen to the app_home_opened Events API event to hear when a user opens your app from the sidebar
app.event("app_home_opened", async ({ payload, context }) => {
    appHome.appHome(app, payload, context);
  
});

app.command('/setup', async ({ command, ack, say }) => {
    // Acknowledge command request
    ack();
    say("Trying to set up");
    onBoard.onBoard(app, bot_token, "alti-pairing");

});

app.action('select', async({payload, ack, say}) => {
    ack();
    console.log("Selected a channel");
    // block action payload type
    console.log(payload);
    onBoard.onBoardExisting(app, bot_token, payload.selected_channel);
});

