//working
const index = require('./index')
const functions = require('firebase-functions');
const {app, token} = index.getBolt();


  // schedule all warmups to differnet users at once.
  exports.warmupMsgs = async function warmupMsgs(hour, minute) {
    // testing with just one warmup

    reminder = new Date();
    reminder.setHours(hour);
    reminder.setMinutes(minute);
    reminder.setSeconds(0);
    return app.client.chat.scheduleMessage({
                      token: token,
                      channel: '#general',
                      text:  `A reminder for warmup`,
                      post_at: reminder.getTime()/1000
                  }).catch((error) => {
                    return error.data;
                });
      
  }
