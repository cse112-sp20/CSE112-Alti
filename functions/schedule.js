//working

exports.warmup = async function warmup(app, token) {
    try {
        // 86400000ms = 24 hours
        let hour = 9;

        //invoke sayStuff every 2 second
        //let timerId = setInterval(sayStuff, 2000, app, token, hour);

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

    } catch(error) {
        console.error(error);
    }
}


async function sayStuff(app, token, hour) {
    var d = new Date();

    app.client.chat.postMessage({
        token: token,
        channel: '#general',
        text:  d.toString()
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
