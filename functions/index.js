const functions = require('firebase-functions');

const { WebClient }= require('@slack/web-api');
const bot = new WebClient(functions.config().slack.token);

const { PubSub } = require('@google-cloud/pubsub');
const pubsubClient = new PubSub();

const crypto = require('crypto');
const tsscmp = require('tsscmp');

function legitSlackRequest(req) {
  // Your signing secret
  const slackSigningSecret = functions.config().slack.signing_secret;

  // Grab the signature and timestamp from the headers
  const requestSignature = req.headers['x-slack-signature'];
  const requestTimestamp = req.headers['x-slack-request-timestamp'];

  // Create the HMAC
  const hmac = crypto.createHmac('sha256', slackSigningSecret);

  // Update it with the Slack Request
  const [version, hash] = requestSignature.split('=');
  const base = `${version}:${requestTimestamp}:${JSON.stringify(req.body)}`;
  hmac.update(base);

  // Returns true if it matches
  return tsscmp(hash, hmac.digest('hex'));
}

exports.slack = functions.https.onRequest(async (req,res) => {


    const legit = legitSlackRequest(req);

    if (!legit) { 
        res.status(403).send('Slack signature mismatch.');
        return;
    }

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