const index = require('./index');
const { app, token} = index.getBolt();

exports.sendSelectChoice = async function(targChannelID,app,token){
	const notificationString = "Send a warmup to your buddy!"
	//warmup selection message json
	const warmupSelect = [
			{
				"type": "section",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Hey there, pick a warmup for your buddy!"
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
					"action_id": "generic_button",
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
					"action_id": "generic_button",
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
					"action_id": "generic_button",
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
					"action_id": "generic_button", 
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
					"action_id": "request_custom_send", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_custom"
				}
			}
		];
	//try function logic
	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.chat.postMessage({
		  // The token you used to initialize your app is stored in the `context` object
		  token: token,
		  channel: targChannelID,
		  text: notificationString,
		  blocks: warmupSelect
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}

exports.requestCustomSend = async function(ack,body,context) {
	await ack();
	console.log(body.channel.id);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'custom_msg_view',
			title: {
			  type: 'plain_text',
			  text: 'Custom Message Warmup'
			},
			blocks: [
			  {
				type: 'input',
				block_id: body.channel.id,
				label: {
				  type: 'plain_text',
				  text: 'Enter your custom message here below.'
				},
				element: {
				  type: 'plain_text_input',
				  action_id: 'input_text',
				  multiline: true
				}
			  }
			],
			submit: {
			  type: 'plain_text',
			  text: 'Submit'
			}
		  }
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.customMsgView =  async function(ack, body, view, context) {
	  // Acknowledge the custom_msg_view event
  ack({
	  //clear the modal off the users screen
	 "response_action": "clear"
  });
  // get a  reference to the view object's values
  const valuesObject = view['state']['values']
  let msgToSend = ''
  let counter = 0;
  let channelID = "";
  //obtain the first key in the values object and use it to grab the user input 
  //as well as the channel the user wants to send the input to
  for (key in valuesObject) {
	  if (counter === 0) {
		msgToSend += valuesObject[key]['input_text']['value'];
		counter++;
		channelID=key;
	  }
  }
  //gets teamID from the action which functions as workspace id
  const teamID = body['team']['id'];
  //gets the userID from the action
  const userID = body['user']['id'];
  //console.log used for local testing
  console.log(userID + " in " + channelID + " sent the following: " + msgToSend+ "in team:"+ teamID);
  //writes the data collected to the firebase
  writeToDB(teamID, userID, channelID,msgToSend,true);
}