
//working
//require('@google-cloud/trace-agent').start({});
// require('@google-cloud/profiler').start({
// 	serviceContext: {
// 	  service: 'schedule',
// 	  version: '1.0.0',
// 	},
// 	logLeveL: 3,
// });
const index = require('./index')
const functions = require('firebase-functions');
const app = index.getBolt();


	  /*
    Description:
        schedule a message to a channel/user at a destined time. Will be used to send
        warmup/cooldown. This function is assumed to be called around midnight. 
    Input: 
        hour - the hour of the mssage to be sent
        minute - the minute of the message
        text - the content of message
        id - the id of the user or channel
    Return:
        the response coming back from slack. 
  */
 exports.scheduleMsg = async function scheduleMsg(hour, minute, text, id, token) {
	// set up the time
	reminder = new Date();
	reminder.setHours(hour);
	reminder.setMinutes(minute);
	reminder.setSeconds(0);
	console.log("Schedule msg runs");
	//call api
	return app.client.chat.scheduleMessage({
										token: token,
										channel: id,
										text:  text,
										post_at: reminder.getTime()/1000 // conversion from milli sec to sec
								}).catch((error) => {
									return error.data;
							});
		
};

	exports.scheduleCooldownChoice = async function(hour, minute, targChannelID,token){
				// set up the time
		reminder = new Date();
		reminder.setHours(hour);
		reminder.setMinutes(minute);
		reminder.setSeconds(0);
		const notificationString = "Send a cool-down to your buddy!"
		
			var res = await app.client.chat.scheduleMessage({
				token: token,
				channel: targChannelID,
				text:  notificationString,
				blocks: cooldownSelect,
				post_at: reminder.getTime()/1000
			}).catch((error) => {
				console.log(error);
			});
			
	};

	exports.scheduleWarmupChoice = async function(hour, minute,targChannelID,token){
		reminder = new Date();
		reminder.setHours(hour);
		reminder.setMinutes(minute);
		reminder.setSeconds(0);
		const notificationString = "Send a warmup to your buddy!"
		
		//try function logic
		var res = await app.client.chat.scheduleMessage({
			token: token,
			channel: targChannelID,
			text:  notificationString,
			blocks: warmupSelect,
			post_at: reminder.getTime()/1000 
		}).catch((error) => {
			console.log(error);
		});
		
	};


	exports.scheduleEndOfDay = async function(hour, minute, text, targChannelID,token){
			// set up the time
		reminder = new Date();
		reminder.setHours(hour);
		reminder.setMinutes(minute);
		reminder.setSeconds(0);
		console.log("Schedule msg runs");
		//call api
		return app.client.chat.scheduleMessage({
											token: token,
											channel: id,
											text:  text,
											blocks: warmupSelect + cooldownSelect,
											post_at: reminder.getTime()/1000 // conversion from milli sec to sec
									}).catch((error) => {
										return error.data;
								});
			
		
	};


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
				"text": "*Speed Typing Test*"
			},
			"accessory": {
				"action_id": "warmup_coding_select",
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
				"action_id": "warmup_article_select",
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
				"action_id": "warmup_puzzle_select",
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
				"action_id": "warmup_quote_select", 
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

	//warmup selection message json
	const cooldownSelect = [
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"emoji": true,
				"text": 'Which cool-down would you like to send your buddy to get them out of "the zone" tomorrow afternoon?'
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Options:*"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Custom Message*"
			},
			"accessory": {
				"action_id": "cooldown_custom_select",
				"type": "button",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Choose"
				},
				"value": "select_custom"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Retrospective Questions*"
			},
			"accessory": {
				"action_id": "cooldown_retro_select",
				"type": "button",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Choose"
				},
				"value": "select_retro"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Non-tech Article*"
			},
			"accessory": {
				"action_id": "cooldown_article_select",
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
				"text": "*Non-tech Video*"
			},
			"accessory": {
				"action_id": "cooldown_video_select", 
				"type": "button",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Choose"
				},
				"value": "select_video"
			}
		}
	];
