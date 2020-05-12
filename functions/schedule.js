//working
const index = require('./index')
const functions = require('firebase-functions');
const {app, token} = index.getBolt();



  // schedule all warmups to differnet users at once.
  exports.warmupMsgs = async function warmupMsgs() {
    // testing with just one warmup
    let reminderHour = 9;
    let reminderMinute = 0;

    reminder = new Date();
    reminder.setHours(reminderHour);
    reminder.setMinutes(reminderMinute);
    reminder.setSeconds(0);

    app.client.chat.scheduleMessage({
                      token: token,
                      channel: '#general',
                      text:  `A reminder for warmup`,
                      post_at: reminder.getTime()/1000
                  });
  }
