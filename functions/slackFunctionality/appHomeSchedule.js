const index = require('./index');
const app = index.getBolt();

const appHome = require('./appHome');
const appHomeObjects = require('../util/appHomeObjects');
const firestoreFuncs = require('../util/firestore');

// variables to remember what the user has set
var warmupTime1 = null;
var warmupTime2 = null;
var cooldownTime1 = null;
var cooldownTime2 = null;

var warmupTimes = 
{
  monTime: null,
  tuesTime: null,
  wedTime: null,
  thursTime: null,
  friTime: null,
  monAMPM: null,
  tuesAMPM: null,
  wedAMPM: null,
  thursAMPM: null,
  friAMPM: null
};

var cooldownTimes = 
{
  monTime: null,
  tuesTime: null,
  wedTime: null,
  thursTime: null,
  friTime: null,
  monAMPM: null,
  tuesAMPM: null,
  wedAMPM: null,
  thursAMPM: null,
  friAMPM: null
};

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];


// APP HOME SCHEDULE SETTERS AND LISTENERS

/* WARM UP
/  Three listeners for the daily warm up times and set button
*/
app.action('warmup_time1_selected', async({payload, ack}) => {
    ack();
    warmupTime1 = payload.selected_option.text.text;
    
});
app.action('warmup_time2_selected', async({payload, ack}) => {
    ack();
    warmupTime2 = payload.selected_option.text.text;

});
app.action('warmup_time_set_button', async({ack, body, context}) => {
    ack();
    var proms = [];
    console.log(warmupTime1);
    console.log(warmupTime2);
    if (warmupTime1 !== null && warmupTime2 !== null) {
        if (warmupTime1 === "12:00" && warmupTime2 === "AM") {
            app.client.views.open({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            return;
        }
        var t = warmupTime1 + " " + warmupTime2;
        // console.log(t);
        for (var i of days) {
            proms.push(firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t, i));
        }
    }
    await Promise.all(proms).catch((error) => { console.log(error); } );
    appHome.updateAppHome(body.user.id, body.team.id, context);

});

/* COOL DOWN
/  Three listeners for the daily cool down times and set button
*/
app.action('cooldown_time1_selected', async({payload, ack}) => {
    ack();
    cooldownTime1 = payload.selected_option.text.text;

});
app.action('cooldown_time2_selected', async({payload, ack}) => {
    ack();
    cooldownTime2 = payload.selected_option.text.text;

});
app.action('cooldown_time_set_button', async({ack, body, context}) => {
    ack();
    var proms = [];
    if (cooldownTime1 !== null && cooldownTime2 !== null) {
        if (cooldownTime1 === "12:00" && cooldownTime2 === "AM") {
            app.client.views.open({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            return;
        }
        var t = cooldownTime1 + " " + cooldownTime2;
        // console.log(t);
        for (var i of days) {
            proms.push(firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t, i));
        }
    }
    await Promise.all(proms).catch((error) => { console.log(error); });
    appHome.updateAppHome(body.user.id, body.team.id, context);
});

// Extra listener for app home event to reset time variables
app.event("app_home_opened", async ({ payload, context }) => {
    warmupTime1 = null;
    warmupTime2 = null;
    cooldownTime1 = null;
    cooldownTime2 = null;
});

// Listener for customize schedule button click to open a modal 
app.action('set_custom_times', async({ack, body, context}) => {
    ack();

    // reset time variables
    resetTimeVariables();

    app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: appHomeObjects.modal
    }).catch((error) => {
        console.log(error);
    });
});


// APP SCHEDULE MODAL LISTENERS

// Listener for submit on modal
app.view('custom_home_schedule_modal', async ({ ack, body, view, context }) => {
    //console.log("Hit done");
    ack();
});


// Listeners for monday in modal
app.action('monday_warmup_time1_selected', async({payload, ack}) => {
    ack();
    warmupTimes.monTime = payload.selected_option.text.text;

});
app.action('monday_warmup_time2_selected', async({payload, ack}) => {
    ack();

    warmupTimes.monAMPM = payload.selected_option.text.text;

});
app.action('monday_cooldown_time1_selected', async({payload, ack}) => {
    ack();

    cooldownTimes.monTime = payload.selected_option.text.text;

});
app.action('monday_cooldown_time2_selected', async({payload, ack}) => {
    ack();

    cooldownTimes.monAMPM = payload.selected_option.text.text;

});
app.action('monday_set_button', async({body, ack, context}) => {
    ack();
    if (warmupTimes.monTime !== null && 
        warmupTimes.monAMPM !== null &&
        cooldownTimes.monTime !== null && 
        cooldownTimes.monAMPM !== null) {
            console.log(warmupTimes.monTime);
            console.log(warmupTimes.monAMPM);
        if ((warmupTimes.monTime === "12:00" && warmupTimes.monAMPM === "AM") ||
            (cooldownTimes.monTime === "12:00" && cooldownTimes.monAMPM === "AM")) {
            app.client.views.push({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            resetTimeVariables();
            return;
        }
        var t1 = warmupTimes.monTime + " " + warmupTimes.monAMPM;
        var t2 = cooldownTimes.monTime + " " + cooldownTimes.monAMPM;
        var proms = [];
        proms.push(firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Monday"));
        proms.push(firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Monday"));
        await Promise.all(proms).catch((error) => { console.log(error); } );
        appHome.updateAppHome(body.user.id, body.team.id, context);
    }
    else {
        console.log("Nope");
    }
});


// Listeners for tuesday in modal
app.action('tuesday_warmup_time1_selected', async({payload, ack}) => {
    ack();
    warmupTimes.tuesTime = payload.selected_option.text.text;

});
app.action('tuesday_warmup_time2_selected', async({payload, ack}) => {
    ack();
    warmupTimes.tuesAMPM = payload.selected_option.text.text;

});
app.action('tuesday_cooldown_time1_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.tuesTime = payload.selected_option.text.text;

});
app.action('tuesday_cooldown_time2_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.tuesAMPM = payload.selected_option.text.text;

});
app.action('tuesday_set_button', async({body, ack, context}) => {
    ack();
    if (warmupTimes.tuesTime !== null && 
        warmupTimes.tuesAMPM !== null &&
        cooldownTimes.tuesTime !== null && 
        cooldownTimes.tuesAMPM !== null) {
        if ((warmupTimes.tuesTime === "12:00" && warmupTimes.tuesAMPM === "AM") ||
        (cooldownTimes.tuesTime === "12:00" && cooldownTimes.tuesAMPM === "AM") ) {
            app.client.views.push({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            resetTimeVariables();
            return;
        }
        var t1 = warmupTimes.tuesTime + " " + warmupTimes.tuesAMPM;
        var t2 = cooldownTimes.tuesTime + " " + cooldownTimes.tuesAMPM;
        var proms = [];
        proms.push(firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Tuesday"));
        proms.push(firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Tuesday"));
        await Promise.all(proms).catch((error) => { console.log(error); } );
        appHome.updateAppHome(body.user.id, body.team.id, context);
    }
    else {
        console.log("Nope");
    }
});

// Listeners for wednesday in modal
app.action('wednesday_warmup_time1_selected', async({payload, ack}) => {
    ack();
    warmupTimes.wedTime = payload.selected_option.text.text;

});
app.action('wednesday_warmup_time2_selected', async({payload, ack}) => {
    ack();
    warmupTimes.wedAMPM = payload.selected_option.text.text;

});
app.action('wednesday_cooldown_time1_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.wedTime = payload.selected_option.text.text;

});
app.action('wednesday_cooldown_time2_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.wedAMPM = payload.selected_option.text.text;

});
app.action('wednesday_set_button', async({body, ack, context}) => {
    ack();
    if (warmupTimes.wedTime !== null && 
        warmupTimes.wedAMPM !== null &&
        cooldownTimes.wedTime !== null && 
        cooldownTimes.wedAMPM !== null) {
        if ((warmupTimes.wedTime === "12:00" && warmupTimes.wedAMPM === "AM") ||
        (cooldownTimes.wedTime === "12:00" && cooldownTimes.wedAMPM === "AM")) {
            app.client.views.push({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            resetTimeVariables();
            return;
        }
        var t1 = warmupTimes.wedTime + " " + warmupTimes.wedAMPM;
        var t2 = cooldownTimes.wedTime + " " + cooldownTimes.wedAMPM;
        var proms = [];
        proms.push(firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Wednesday"));
        proms.push(firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Wednesday"));
        await Promise.all(proms).catch((error) => { console.log(error); } );
        appHome.updateAppHome(body.user.id, body.team.id, context);
    }
    else {
        console.log("Nope");
    }
});

// Listeners for thursday in modal
app.action('thursday_warmup_time1_selected', async({payload, ack}) => {
    ack();
    warmupTimes.thursTime = payload.selected_option.text.text;

});
app.action('thursday_warmup_time2_selected', async({payload, ack}) => {
    ack();
    warmupTimes.thursAMPM = payload.selected_option.text.text;

});
app.action('thursday_cooldown_time1_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.thursTime = payload.selected_option.text.text;

});
app.action('thursday_cooldown_time2_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.thursAMPM = payload.selected_option.text.text;

});
app.action('thursday_set_button', async({body, ack, context}) => {
    ack();
    if (warmupTimes.thursTime !== null && 
        warmupTimes.thursAMPM !== null &&
        cooldownTimes.thursTime !== null && 
        cooldownTimes.thursAMPM !== null) {
        if ((warmupTimes.thursTime === "12:00" && warmupTimes.thursAMPM === "AM") ||
        (cooldownTimes.thursTime === "12:00" && cooldownTimes.thursAMPM === "AM")) {
            app.client.views.push({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            resetTimeVariables();
            return;
        }
        var t1 = warmupTimes.thursTime + " " + warmupTimes.thursAMPM;
        var t2 = cooldownTimes.thursTime + " " + cooldownTimes.thursAMPM;
        var proms = [];
        proms.push(firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Thursday"));
        proms.push(firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Thursday"));
        await Promise.all(proms).catch((error) => { console.log(error); } );
        appHome.updateAppHome(body.user.id, body.team.id, context);
    }
    else {
        console.log("Nope");
    }
});

// Listeners for friday in modal
app.action('friday_warmup_time1_selected', async({payload, ack}) => {
    ack();
    warmupTimes.friTime = payload.selected_option.text.text;

});
app.action('friday_warmup_time2_selected', async({payload, ack}) => {
    ack();
    warmupTimes.friAMPM = payload.selected_option.text.text;

});
app.action('friday_cooldown_time1_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.friTime = payload.selected_option.text.text;

});
app.action('friday_cooldown_time2_selected', async({payload, ack}) => {
    ack();
    cooldownTimes.friAMPM = payload.selected_option.text.text;

});
app.action('friday_set_button', async({body, ack, context}) => {
    ack();
    if (warmupTimes.friTime !== null && 
        warmupTimes.friAMPM !== null &&
        cooldownTimes.friTime !== null && 
        cooldownTimes.friAMPM !== null) {
        if ((warmupTimes.friTime === "12:00" && warmupTimes.friAMPM === "AM") ||
        (cooldownTimes.friTime === "12:00" && cooldownTimes.friAMPM === "AM")) {
            app.client.views.push({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: appHomeObjects.cant_select_12am
            }).catch((error) => {
                console.log(error);
            });
            resetTimeVariables();
            return;
        }
        var t1 = warmupTimes.friTime + " " + warmupTimes.friAMPM;
        var t2 = cooldownTimes.friTime + " " + cooldownTimes.friAMPM;
        var proms = [];
        proms.push(firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Friday"));
        proms.push(firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Friday"));
        await Promise.all(proms).catch((error) => { console.log(error); } );
        appHome.updateAppHome(body.user.id, body.team.id, context);
    }
    else {
        console.log("Nope");
    }
});

// Helper function to reset time variables when user exits and reenters modal
function resetTimeVariables() {
    warmupTimes = 
    {
        monTime: null,
        tuesTime: null,
        wedTime: null,
        thursTime: null,
        friTime: null,
        monAMPM: null,
        tuesAMPM: null,
        wedAMPM: null,
        thursAMPM: null,
        friAMPM: null
    };

    cooldownTimes = 
    {
        monTime: null,
        tuesTime: null,
        wedTime: null,
        thursTime: null,
        friTime: null,
        monAMPM: null,
        tuesAMPM: null,
        wedAMPM: null,
        thursAMPM: null,
        friAMPM: null
    };
}
  