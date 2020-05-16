//working
const index = require('./index')
const functions = require('firebase-functions');
const {app, token} = index.getBolt();


  // schedule all warmups to differnet users at once.
  // id could be channel or user or dm thread, or name.
  exports.scheduleMsg = async function scheduleMsg(hour, minute, text, id) {
    // testing with just one warmup

    reminder = new Date();
    reminder.setHours(hour);
    reminder.setMinutes(minute);
    reminder.setSeconds(0);
    return app.client.chat.scheduleMessage({
                      token: token,
                      channel: id,
                      text:  text,
                      post_at: reminder.getTime()/1000
                  }).catch((error) => {
                    return error.data;
                });
      
  }
