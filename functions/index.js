const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');
const shuffle = require('shuffle-array');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const token = config.slack.token;
const pairUp = require('./pairUp');

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
    pairUp.pairUp(app, token);

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
exports.slack = functions.https.onRequest(expressReceiver.app);


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