const index = require('./index');
const {app, token} = index.getBolt();

const appHomeObjects = require('./appHomeObjects');


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
}

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
}



// Three listeners for the daily warm up times and set button
app.action('warmup_time1_selected', async({payload, ack}) => {
    ack();
    console.log("Selected time");
    console.log(payload);
    warmupTime1 = payload.selected_option.text.text;
    
});
app.action('warmup_time2_selected', async({payload, ack}) => {
    ack();
    console.log("Selected warmup ap/pm");
    console.log(payload);
    warmupTime2 = payload.selected_option.text.text;

});
app.action('warmup_time_set_button', async({payload, ack}) => {
    ack();
    if (warmupTime1 !== null && warmupTime2 !== null) {
        console.log(warmupTime1 + " " + warmupTime2);
    }
});

// Three listeners for the daily cool down times and set button
app.action('cooldown_time1_selected', async({payload, ack}) => {
    ack();
    console.log("Selected time");
    console.log(payload);
    cooldownTime1 = payload.selected_option.text.text;

});
app.action('cooldown_time2_selected', async({payload, ack}) => {
    ack();
    console.log("Selected warmup ap/pm");
    console.log(payload);
    cooldownTime2 = payload.selected_option.text.text;

});
app.action('cooldown_time_set_button', async({payload, ack}) => {
    ack();
    if (cooldownTime1 !== null && cooldownTime2 !== null) {
        console.log(cooldownTime1 + " " + cooldownTime2);
    }
});


// Listener to open a modal when user wants to set a custom weekly schedule
app.action('set_custom_times', async({ack, body, context}) => {
    ack();
    console.log(body);

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

// Listener for submit on module
app.view('custom_home_schedule_modal', async ({ ack, body, view, context }) => {
    console.log("Hit done");
    ack();
});


// Listeners for monday in modal
app.action('monday_warmup_time1_selected', async({payload, ack}) => {
    ack();
    console.log("Selected time");
    console.log(payload);
    warmupTimes.monTime = payload.selected_option.text.text;

});
app.action('monday_warmup_time2_selected', async({payload, ack}) => {
    ack();
    console.log("Selected warmup ap/pm");
    console.log(payload);
    warmupTimes.monAMPM = payload.selected_option.text.text;

});
app.action('monday_cooldown_time1_selected', async({payload, ack}) => {
    ack();
    console.log("Selected time");
    console.log(payload);
    cooldownTimes.monTime = payload.selected_option.text.text;

});
app.action('monday_cooldown_time2_selected', async({payload, ack}) => {
    ack();
    console.log("Selected warmup ap/pm");
    console.log(payload);
    cooldownTimes.monAMPM = payload.selected_option.text.text;

});
app.action('monday_set_button', async({payload, ack}) => {
    ack();
    if (warmupTimes.monTime !== null && 
        warmupTimes.monAMPM !== null &&
        cooldownTimes.monTime !== null && 
        cooldownTimes.monAMPM !== null) {
        console.log(warmupTimes.monTime + " " + warmupTimes.monAMPM);
        console.log(cooldownTimes.monTime + " " + cooldownTimes.monAMPM);
    }
    else {
        console.log("Nope");
    }
});
  

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
    }

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
    }
}
  