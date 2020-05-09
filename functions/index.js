const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');
const shuffle = require('shuffle-array');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const token = config.slack.token;
const bot_token = config.slack.bot_token;
const bot_id = config.slack.bot_id;


admin.initializeApp();

const expressReceiver = new ExpressReceiver({
    signingSecret: signingSecret,
    endpoints: '/events',
    botId: bot_id
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
    pairUp();

});

app.message(async ({ message, context }) => {
    try{
        schedule();
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

async function pairUp(){
    try{
        const {members} = await app.client.users.list({
            token:token
        });
   
        // Get the human users among all users
        const users = Array.from(members);
        const humans = users.filter( user => {
            //SlackBot is includeded now for testing purposes, need to filter that out too.
            return !user.is_bot && user.id!=='USLACKBOT';
        });

        if(humans.length <= 1){
            console.log("Could not pair since there is less than 2 people in the workspace");
            return;
        }
        var ids = humans.map( human => human.id );

        // Randomize the order of people
        shuffle(ids);

        for (i = 0; i < ids.length/2; i++) {
            
            // var pair = new Array(ids[i], ids[i]);
            // console.log(pair);
            
            var responsePromise = app.client.conversations.open({
                token: token,
                return_im: false,
                users: ids[i]+','+ids[(ids.length/2) + i]
            })
            responsePromise.then(response => handlePairingResponse(response))
                                .catch(console.error);

        }

    }
    catch(error){
        console.error(error);
    }
}
async function handlePairingResponse(response){

    if(!response.ok){
        return console.error(response.error);
    }
    // app.client.conversations.join({
    //     token: token,
    //     channel: response.channel.id
    // });
    return app.client.chat.postMessage({
        token: token,
        channel: response.channel.id,
        text: "You ppl just got paired!"
    });
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