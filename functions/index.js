const functions = require('firebase-functions');

const { WebClient }= require('@slack/web-api');
const bot = new WebClient(functions.config().slack.token);

const { PubSub } = require('@google-cloud/pubsub');
const pubsubClient = new PubSub();


exports.slack = functions.https.onRequest(async (req,res) => {

    // We need to verify the request here. this is a security problem
    // verifySlackSignature(req); // See snippet above for implementation

    const data = JSON.stringify(req.body);
    const dataBuffer = Buffer.from(data);

    await pubsubClient
            .topic('personal-message').publish(dataBuffer);

    // // Send a Message
    // await bot.chat.postMessage({

    //     channel: "#general",
    //     text: req.body.event.text //`Uh someone just slid in my dms. What a creep`
    // });
    res.sendStatus(200);


});
exports.personalMesage = functions.pubsub
  .topic('personal-message')
  .onPublish(async (message, context) => {

    const { event } = message.json; 

    const { user, channel , text} = event;



    // Get the full Slack profile
    const userResult = await bot.users.profile.get({ user });
    // const { email, display_name } = userResult.profile;

    const print = JSON.stringify(userResult.profile.real_name);
    // Send a Message
    const chatMessage = await bot.chat.postMessage({
        channel: '#general',
        text: `${userResult.profile.first_name} just DMd me. What a creep! Other people should also know that "${text}"`
    });
});