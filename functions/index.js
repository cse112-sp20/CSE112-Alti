const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;

const firestoreFuncs = require('./firestore');
//OAuth Endpoint for Authentication
const oauthEndpoint = require('./oauth');


const expressReceiver = new ExpressReceiver({
    signingSecret: signingSecret,
    endpoints: '/events',
});


const authorizeFunction = async ({ teamId }) => firestoreFuncs.getAPIPair(teamId);

const app = new App({
    receiver: expressReceiver,
    authorize: authorizeFunction,
});

//arrow function for simplicity
exports.getBolt = () => app;


const generateTaskData = require('./generateTaskData');
const warmupMessage = require('./warmupMessage');
const pubsubScheduler = require('./pubsubScheduler');
const schedule = require('./schedule');
const pairUp = require('./pairUp');
const onBoard = require('./onBoard');
const appHome = require('./appHome');
const appHomeSchedule = require('./appHomeSchedule');
const createNewChannel = require('./createNewChannel');
const leaderboard = require('./leaderboard');
exports.scheduledPairUp = pubsubScheduler.scheduledPairUp;
exports.scheduleWarmup = pubsubScheduler.scheduleWarmup;
exports.scheduleDaily = pubsubScheduler.scheduleDaily;
exports.scheduledLeaderboard = leaderboard.scheduledLeaderboard;


//Test Ruixian
exports.test1 = pubsubScheduler.test1;
//



// Global error handler
app.error(console.log);

// app.command('/warmup', async({command, ack, say}) => {
//     ack();
//     say(`Trying to schedule a warmup`);
//     //let hour = parseInt(command.text.split(" ")[0])
//     //let minute = parseInt(command.text.split(" ")[1])
//     //schedule.warmup(app, bot_token, hour , minute);
// });


// TEST LEADERBOARD
// To test: Go to app home, under the Messages tab, send any message to the app.
// The leaderboard message will be posted in the designated pairing channel.

app.message(async ({ context }) => {
    try {
        console.log("HELLO! It is Friday, and the time is 5 PM.");

        // get bot token
        token = context.botToken;

        // get workspace info
        const workspaceInfo = await app.client.team.info({
            token: token
        });

        // get workspace id
        const workspaceID = workspaceInfo.team.id;

    // send message!
    leaderboard.sendLeaderboardMessage(app, token, workspaceID);

    } catch (error) {
        console.log(error);
    }
});


app.message(async ({ message, context }) => {
    try{
        if(message.channel_type === 'im'){
            console.log("Message object: ");
            console.log(message);
            app.client.chat.postMessage({
                token: context.botToken,
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


//export this to separate file
exports.oauth = oauthEndpoint.oAuthFunction;

app.command('/firestore', async ({ command, ack, say}) => {
    // Acknowledge command request
    ack();
    firestoreFuncs.firestoreTest();
    say(`Trying to firebase`);
});



// Handle '/setupWarmup` command invocations
app.command('/setupwarmup', async ({ command, ack, say, context}) => {
    // Acknowledge command request
    ack();
	//send Warmup prompts to the channel that this command was called from
    warmupMessage.sendSelectChoice(command.channel_id,app, context.botToken);
});

// Handle '/getwarmup' command invocations
app.command('/getwarmup', async ({ command, ack, say, context }) => {
    // Acknowledge command request
    ack();

    warmupMessage.sendExercisePrompt(command.team_id, command.user_id, command.channel_id, true, context);
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
app.command('/setupcooldown', async ({ command, ack, say, context }) => {
    // Acknowledge command request
    ack();
	//send Warmup prompts to the channel that this command was called from
    warmupMessage.sendSelectCooldownChoice(command.channel_id,app, context.botToken);
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

exports.testFirestore = functions.https.onRequest(async (req, res) => {
    console.log(await  firestoreFuncs.getExercisePrompt('T011H6FAPV4', 'U011C8CCYDV', true));
});
