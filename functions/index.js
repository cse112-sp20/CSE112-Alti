const functions = require('firebase-functions');

const { WebClient }= require('@slack/web-api');
const bot = new WebClient(functions.config().slack.token);

const { PubSub } = require('@google-cloud/pubsub');
const pubsubClient = new PubSub();

const crypto = require('crypto');
const tsscmp = require('tsscmp');

// Taken from Jeff Delaney in fireship.io
// Validates that the request is a legit request from slack
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

    //Checks if the request is a legit slack request
    const legit = legitSlackRequest(req);
    if (!legit) { 
        res.status(403).send('Slack signature mismatch.');
        return;
    }

    const { event } = req.body; 
    
    const { type } = event; 
    //Check if the event is a message
    if (type === "message"){  
        const { channel_type } = event;
        // If it's a direct message   
        if(channel_type === "im"){

            //Send the data to the pubsub client. Since we need to respond to events in a short time,
            // pubsub runs the processing somewhere else and we can return
            const data = JSON.stringify(event);
            const dataBuffer = Buffer.from(data);
        
            await pubsubClient
                    .topic('personal-message').publish(dataBuffer);
        }
    }

    res.sendStatus(200);


});
exports.personalMesage = functions.pubsub
  .topic('personal-message')
  .onPublish(async (message, context) => {

    const { user, channel , text} = message.json;

    const userResult = await bot.users.profile.get({ user });
    // Send a Message
    const chatMessage = await bot.chat.postMessage({
        channel: '#general',
        text: `${userResult.profile.first_name} just DMd me. What a creep! Other people should also know that "${text}"`
    });
});