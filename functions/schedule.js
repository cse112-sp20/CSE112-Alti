//working

exports.warmup = async function warmup(app, token) {
    try {

        // 86400000ms = 24 hours
        let hour = 9;

        //invoke sayStuff every 2 second
        //let timerId = setInterval(sayStuff, 2000, app, token, hour);

<<<<<<< HEAD
<<<<<<< HEAD
        var now = new Date(),
        start,
        wait;

        if (now.getHours() < hour) {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
        } else {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0, 0);
        }

        wait = start.getTime() - now.getTime();

        if(wait <= 0) { //If missed 8am before going into the setTimeout
            console.log('Oops, missed the hour');
            every8am(yourcode); //Retry
        } else {
            setTimeout(function () { //Wait 8am
                setInterval(function () {
                    yourcode();
                }, 86400000); //Every day
            },wait);
        }
=======
        //var d = new Date();

        let timerId = setInterval(sayStuff, 60000, app, token, hour);
>>>>>>> 39e13bda147a81ef48f0974f8d71162fd9e661f1
=======
        // Guide set timeout event to certain time, then set interval function every 24 hours.
        // Need to timeout until 9:00 am, it runs sayStuff once, sayStuff will run dummy function
        // finalReminder which is going to run indefnitely every day at 9 am afterwards.

        // Need to figure out how to timeout until 9am. 
        var d = new Date();
        var current = d.getTime();

        // Currently timing out for just 2 seconds
        let timerId = setTimeout(sayStuff, 2000, app, token, hour);
>>>>>>> efed2d9f7fd757ee8d0bc0415dd19dabdb24b400

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

    // Change time val to 86400000 for recurring 24 hours
    var time = setInterval(finalReminder, 10000, app, token, hour);

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
