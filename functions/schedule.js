//working
const index = require('./index')
const functions = require('firebase-functions');
const {app, token} = index.getBolt();

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
  exports.scheduleMsg = async function scheduleMsg(hour, minute, text, id) {
    // set up the time
    reminder = new Date();
    reminder.setHours(hour);
    reminder.setMinutes(minute);
    reminder.setSeconds(0);
    console.log(token);
    //call api
    return app.client.chat.scheduleMessage({
                      token: token,
                      channel: id,
                      text:  text,
                      post_at: reminder.getTime()/1000 // conversion from milli sec to sec
                  }).catch((error) => {
                    return error.data;
                });
      
  }
