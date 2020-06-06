
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
		warmup/cooldown or prompt the user to choose a warmup/cooldown for the next day. 
		This function is assumed to be called around midnight. If the blockparameter is 
		passed, the text will show up as the notification string and the message will be the 
		block itself. If it is not passed, the text will be the whole message.
    Input: 
        hour - the hour of the mssage to be sent
        minute - the minute of the message
        text - the content of message
		id - the id of the user or channel
		blocks (optional) - the visual block to be shown instead of just the message
    Return:
        the response coming back from slack. 
  */
 exports.scheduleMsg = async function scheduleMsg(hour, minute, text, id, token, blocks=undefined) {
	// set up the time
	// convert to utc then to pst to set correct hour and minutes, then back to utc for correct timestamp
	/* 1
	var reminder = new Date();
	var localTime = reminder.getTime();
	var localOffset = reminder.getTimezoneOffset()*60000;
	var utc = localTime + localOffset;
	var offset = -7;
	var cali = (utc + (3600000 * offset));
	var newDate = new Date(cali);
	newDate.setHours(hour);
	newDate.setMinutes(minute);
	newDate.setSeconds(0);
	newDate = new Date(newDate.getTime() - (3600000 * offset));
*/
// 2: Construct date string to create date obj
	var now = new Date();
	// adjust current timestamp to be behind to get proper date of pst timezone
	now = now - 420 * 60 * 1000;

	now = new Date(now);
	var year, month, day;
	year = now.getFullYear();
	month = String(now.getUTCMonth() + 1);
	if (month.length === 1) {
		month = "0" + month;
	}
	day = String(now.getUTCDate());
	if (day.length === 1) {
		day = "0" + day;	
	}
	hour = String(hour);
	if (hour.length === 1) {
		hour = "0" + hour;
	}
	minute = String(minute);
	if (minute.length === 1) {
		minute = "0" + minute;
	}

	var dateString = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00.000-07:00";
	//console.log(dateString);
	var newDate = new Date(dateString);

	var textSection;
	if (blocks !== undefined) {
		textSection =[
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": text
				}
			}
		];
	}
	blocks = textSection.concat(blocks);
	//call api
	return await app.client.chat.scheduleMessage({
										token: token,
										channel: id,
										text:  text,
										blocks: blocks,
										post_at: newDate.getTime()/1000 // conversion from milli sec to sec
								}).catch((error) => {
									return error.data;
							});
		
};