//working

exports.warmup = async function warmup(app, token) {
    try {

        // 86400000ms = 24 hours
        let hour = 9;

        //invoke sayStuff every 2 second
        //let timerId = setInterval(sayStuff, 2000, app, token, hour);

        // Guide set timeout event to certain time, then set interval function every 24 hours.
        // Need to timeout until 9:00 am, it runs sayStuff once, sayStuff will run dummy function
        // finalReminder which is going to run indefnitely every day at 9 am afterwards.

        // Need to figure out how to timeout until 9am. 
        var d = new Date();
        var c = new Date();

        var currentHour = d.getHours();

        if( currentHour < 9 )
        {
            c.setHours(9);
            c.setMinutes(0);
            c.setSeconds(0);
        }
        else
        {
            c.setDate(d.getDate()+1);
            c.setHours(9);
            c.setMinutes(0);
            c.setSeconds(0);
        }

        var timeoutDuration = (c.getTime() - d.getTime());

        // Timing out until the next 9:00 am time
        let timerId = setTimeout(sayStuff, timeoutDuration, app, token, hour);

    } catch(error) {
        console.error(error);
    }
}

async function sayStuff(app, token, hour) {
    var d = new Date();

    // Just a check, but if working properly this if case is useless
    if( d.getHours() == 9 )
    {
        app.client.chat.postMessage({
            token: token,
            channel: '#general',
            text:  "This is your first 9:00 am Reminder"
        });
    }

    // Change time val to 86400000 for recurring 24 hours, test with 2,3 sec
    var time = setInterval(finalReminder, 86400000, app, token, hour);

}

async function finalReminder(app, token, hour) {
        app.client.chat.postMessage({
            token: token,
            channel: '#general',
            text:  "This is your recurring 9:00 am Reminder"
        });
}

//doesnt show anything for some reason
exports.show = async function show(app, token) {
    try {
        const result = await app.client.reminders.list({
            token: token
        });

        app.client.chat.postMessage({
            token: bot_token,
            channel: '#general',
            text: `${result.reminders}`
        });

    } catch(error) {
        console.error(error)
    }
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