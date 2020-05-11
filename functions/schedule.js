//working

exports.warmup = async function warmup(app, token) {
    try {

        // 86400000ms = 24 hours
        let hour = 12;
        let minute = 5;

        //invoke sayStuff every 2 second
        //let timerId = setInterval(sayStuff, 2000, app, token, hour);

        // Guide set timeout event to certain time, then set interval function every 24 hours.
        // Need to timeout until 9:00 am, it runs sayStuff once, sayStuff will run dummy function
        // finalReminder which is going to run indefnitely every day at 9 am afterwards.

        // Need to figure out how to timeout until 9am. 
        var now = new Date();
        var reminder = new Date();

        reminder.setHours(hour);
        reminder.setMinutes(minute);
        reminder.setSeconds(0);

        // within 30 sec
        if(now.getTime() > reminder.getTime() - 30000)
            reminder.setDate(now.getDate()+1);

        //confirmation
        app.client.chat.postMessage({
            token: token,
            channel: '#general',
            text:  "Setting a reminder at " + reminder.toString()
        });

        // Time out until the next 9:00 am time
        var timeoutDuration = (reminder.getTime() - now.getTime());
        let timerId = setTimeout(sayStuff, timeoutDuration, app, token, reminder);

    } catch(error) {
        console.error(error);
    }
}

async function sayStuff(app, token, reminder) {
    var now = new Date();
    let errorRange = 60000; // within 1 minute
    
    app.client.chat.postMessage({
        token: token,
        channel: '#general',
        text:  (reminder.getTime()-now.getTime()).toString()
    });

    // Just a check, but if working properly this if case is useless
    if(reminder.getTime() - now.getTime() < errorRange)
    {
        app.client.chat.postMessage({
            token: token,
            channel: '#general',
            text:  "This is your first Reminder"
        });
    }

    // Change time val to 86400000 for recurring 24 hours, tested with 2,3 sec
    var time = setInterval(finalReminder, 2000, app, token, reminder);

}

async function finalReminder(app, token, reminder) {
        app.client.chat.postMessage({
            token: token,
            channel: '#general',
            text:  "This is your recurring Reminder"
        });
}



// Scheduling message, testing

        // 9 am time stamp for 11th May 2020
        //let timeStamp = 1589187600;
        // Add 86400 for next day 9 am

        // // Was experimenting with for loop simple scheduling messages, to schedule all reminders at once
        // var d = new Date('Mon, 11 May 2020 16:00:00 UTC');
        // var x = new Date();

        // var one_day=1000*60*60*24;    // Convert both dates to milliseconds
        // var fms = first.getTime();   
        // var sms = second.getTime();    // Calculate the difference in milliseconds  
        // var diff_ms = sms - fms;        // Convert back to days and return   
        // var daysdiff = Math.round(diff_ms/one_day); 

        // app.client.chat.scheduleMessage({
        //     token: token,
        //     channel: '#general',
        //     text:  "Warmup Reminder at 9:00 am"
        //     post_at: 1589187600
        // });