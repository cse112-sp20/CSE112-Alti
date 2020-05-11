//working

exports.warmup = async function warmup(app, token) {
    try {

        // 9 am time stamp for 11th May 2020
        let timeStamp = 1589187600;
        // Add 86400 for next day 9 am

        // // Was experimenting with for loop simple scheduling messages, to schedule all reminders at once
        // var d = new Date('Mon, 11 May 2020 16:00:00 UTC');
        // var x = new Date();

        // var one_day=1000*60*60*24;    // Convert both dates to milliseconds
        // var date1_ms = d.getTime();   
        // var date2_ms = date2.getTime();    // Calculate the difference in milliseconds  
        // var difference_ms = date2_ms - date1_ms;        // Convert back to days and return   
        // var daysdiff = Math.round(difference_ms/one_day); 

        // app.client.chat.scheduleMessage({
        //     token: token,
        //     channel: '#general',
        //     text:  "Warmup Reminder at 9:00 am"
        //     post_at: 1589187600
        // });


        // 86400000ms = 24 hours
        let hour = 9;

        //invoke sayStuff every 2 second
        //let timerId = setInterval(sayStuff, 2000, app, token, hour);

        //var d = new Date();

        let timerId = setInterval(sayStuff, 60000, app, token, hour);

    } catch(error) {
        console.error(error);
    }
}

async function sayStuff(app, token, hour) {
    var d = new Date();

    var count = 0;
    if( d.getHours() == 9 && count == 0 )
    {
        app.client.chat.postMessage({
            token: token,
            channel: '#general',
            text:  "This is your 9:00 am Reminder"
        });

        count++;
    }
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
