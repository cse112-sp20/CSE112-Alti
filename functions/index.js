const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const token = config.slack.token;
const pairUp = require('./pairUp');
const bot_token = config.slack.bot_token;


admin.initializeApp();

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
    pairUp.pairUp(app, bot_token);

});

app.message(async ({ message, context }) => {
    try{
        // schedule(); //doesnt work for now
        // console.log(message)
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
            token: token,
            text: "Scheduling a message everyday at 3:45pm", 
            time: "5:10 pm", // tested with /remind command
            //channel: "#general"
        });
    }
    catch(error) {
        console.error(error);
    }
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