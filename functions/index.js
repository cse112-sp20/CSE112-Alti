const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const user_token = config.slack.user_token;
const pairUp = require('./pairUp');
const schedule = require('./schedule');
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

<<<<<<< HEAD
=======
//fixing


async function schedule() {
    try {
        // This works, but it cant be recurring.
        // const result = await app.client.chat.scheduleMessage({
        //     // The token you used to initialize your app is stored in the `context` object
        //     token: token,
        //     channel: '#general',
        //     post_at: 1588966200, //12:30
        //     text: 'Scheduling a message at 12:30'
        // });
        const result = await app.client.reminders.add({
            token: user_token,
            text: "Scheduling a message everyday at 3:45pm",
            time: "5:10 pm", // tested with /remind command
            //channel: "#general"
        });
    }
    catch(error) {
        console.error(error);
    }
}
>>>>>>> 65c77067f9535966af50379191b773cabdb87736


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