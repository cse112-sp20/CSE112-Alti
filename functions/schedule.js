//working

exports.warmup = async function warmup(app, token) {
    try {
        // 86400000ms = 24 hours
        let hour = 9;

        //invoke sayStuff every 2 second
        let timerId = setInterval(sayStuff, 2000, app, token, hour);

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
