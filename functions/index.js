const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');

admin.initializeApp();

const expressReceiver = new ExpressReceiver({
    signingSecret: functions.config().slack.signing_secret,
    endpoints: '/events'
});

const app = new App({
    receiver: expressReceiver,
    token: functions.config().slack.token
});

// Global error handler
app.error(console.log);

// Handle `/echo` command invocations
app.command('/pairup', async ({ command, ack, say }) => {
    // Acknowledge command request
    ack();
    say(`You said "${command.text}"`);
});
app.message(async ({ message, context }) => {
    try{
        // console.log(message)
        if(message.channel_type === 'im'){
            app.client.chat.postMessage({
                token: context.botToken,
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