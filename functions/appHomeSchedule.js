const index = require('./index');
const app = index.getBolt();

const appHome = require('./appHome');
const appHomeObjects = require('./appHomeObjects');
const firestoreFuncs = require('./firestore');

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
    // console.log(body);
    if (warmupTime1 !== null && warmupTime2 !== null) {
        var t = warmupTime1 + " " + warmupTime2;
        // console.log(t);
        for (vari of days) {
            firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t, i);
        }
    }
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
    if (cooldownTime1 !== null && cooldownTime2 !== null) {
        var t = cooldownTime1 + " " + cooldownTime2;
        // console.log(t);
        for (var i of days) {
            firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t, i);
        }
    }
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
        token: token,
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
        // console.log(warmupTimes.monTime + " " + warmupTimes.monAMPM);
        // console.log(cooldownTimes.monTime + " " + cooldownTimes.monAMPM);
        var t1 = warmupTimes.monTime + " " + warmupTimes.monAMPM;
        var t2 = cooldownTimes.monTime + " " + cooldownTimes.monAMPM;
        firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Monday");
        firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Monday");
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
        // console.log(warmupTimes.tuesTime + " " + warmupTimes.tuesAMPM);
        // console.log(cooldownTimes.tuesTime + " " + cooldownTimes.tuesAMPM);
        var t1 = warmupTimes.tuesTime + " " + warmupTimes.tuesAMPM;
        var t2 = cooldownTimes.tuesTime + " " + cooldownTimes.tuesAMPM;
        firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Tuesday");
        firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Tuesday");
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
        // console.log(warmupTimes.wedTime + " " + warmupTimes.wedAMPM);
        // console.log(cooldownTimes.wedTime + " " + cooldownTimes.wedAMPM);
        var t1 = warmupTimes.wedTime + " " + warmupTimes.wedAMPM;
        var t2 = cooldownTimes.wedTime + " " + cooldownTimes.wedAMPM;
        firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Wednesday");
        firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Wednesday");
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
        console.log(warmupTimes.thursTime + " " + warmupTimes.thursAMPM);
        console.log(cooldownTimes.thursTime + " " + cooldownTimes.thursAMPM);
        var t1 = warmupTimes.thursTime + " " + warmupTimes.thursAMPM;
        var t2 = cooldownTimes.thursTime + " " + cooldownTimes.thursAMPM;
        firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Thursday");
        firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Thursday");
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
        console.log(warmupTimes.friTime + " " + warmupTimes.friAMPM);
        console.log(cooldownTimes.friTime + " " + cooldownTimes.friAMPM);
        var t1 = warmupTimes.friTime + " " + warmupTimes.friAMPM;
        var t2 = cooldownTimes.friTime + " " + cooldownTimes.friAMPM;
        firestoreFuncs.setWarmupTime(body.team.id, body.user.id, t1, "Friday");
        firestoreFuncs.setCooldownTime(body.team.id, body.user.id, t2, "Friday");
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
  