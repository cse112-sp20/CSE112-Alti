const functions = require('firebase-functions');
const { App, ExpressReceiver } = require('@slack/bolt');
const admin = require('firebase-admin');
const shuffle = require('shuffle-array');

const config = functions.config();
const signingSecret = config.slack.signing_secret;
const token = config.slack.token;

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
    pairUp();

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

// Handle the occurence when a user opens the app home tab
app.event("app_home_opened", async ({ payload, context }) => {
  //generate a reference to the user id 
  const userId = payload.user;
  try {
    // Call the views.publish method using the built-in WebClient
    const result = await app.client.views.publish({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      user_id: userId,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        "type": "home",
        "blocks": [
			{
				"type": "section",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": `*Hey ${  userId  }, pick a warmup for your buddy!*`
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Buddy Name*\nTuesday, January 21 9:30 AM\n"
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Pick a content type:*"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Code Speed Typing Test*"
				},
				"accessory": {
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_test"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Tech Article*"
				},
				"accessory": {
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_article"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Easy Online Puzzle*"
				},
				"accessory": {
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_puzzle"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Motivational Quote*"
				},
				"accessory": {
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_quote"
				}
			},
			 {
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Custom Message*"
				},
				"accessory": {
					"action_id": "select_custom", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_custom"
				}
			}
		]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});
//submission responser handler
app.action('ml_input', async ({ body, context, ack }) => {
  response_action: 'clear'
});

//selection respose handler
app.action('select_custom', async ({ body, context, ack }) => {
  ack();  
  try {
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: {
		"type": "modal",
		"title": {
			"type": "plain_text",
			"text": "Message your buddy!",
			"emoji": true
		},
		"submit": {
			"type": "plain_text",
			"text": "Submit",
			"emoji": true
		},
		"close": {
			"type": "plain_text",
			"text": "Cancel",
			"emoji": true
		},
		"blocks": [
			{
				"type": "input",
				"element": {
					"type": "plain_text_input",
					"action_id": "ml_input",
					"multiline": true,
					"placeholder": {
						"type": "plain_text",
						"text": "Type it here!"
					}
				},
				"label": {
					"type": "plain_text",
					"text": "Warmup"
				}
			}
		]
	}
    });
    
  } catch(e) {
    console.log(e);
    app.error(e);
  }
});


exports.slack = functions.https.onRequest(expressReceiver.app);


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