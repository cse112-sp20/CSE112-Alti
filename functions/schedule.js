//working

exports.warmup = async function warmup(app, token) {
    try {

        const result = await app.client.reminders.add({
            token: token,
            text: "Scheduling a warmup at 9 am", 
            time: "every weekday at 9 am", // tested with /remind command
        });
    } catch(error) {
        console.error(error);
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
