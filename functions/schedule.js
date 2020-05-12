//working
const index = require('./index')
const functions = require('firebase-functions');
const {app, token} = index.getBolt();



  exports.warmupMsgs = async function warmupMsgs() {
    let reminderHour = 1;
    let reminderMinute = 3;

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
