const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;
const pairUp = require('./pairUp');
const bot_token = config.slack.bot_token;


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

const schedule = require('./schedule');

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
    say(`Trying to schedule a warmup`);
    schedule.scheduleWarmup;
    //let hour = parseInt(command.text.split(" ")[0])
    //let minute = parseInt(command.text.split(" ")[1])
    //schedule.warmup(app, bot_token, hour , minute); 
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