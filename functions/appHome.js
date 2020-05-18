const index = require('./index');
const {app, token} = index.getBolt();

const appHomeObjects = require('./appHomeObjects');



// Listen to the app_home_opened Events API event to hear when a user opens your app from the sidebar
app.event("app_home_opened", async ({ payload, context }) => {
  console.log("It's running");

  appHome(app, payload, context);
});

// appHome return the json object creating the application's home page
exports.appHome = appHome;
async function appHome(app, payload, context) {
    const userId = payload.user;

    // TODO 
    // Add database call to get current pairing channel

    try {
        // Call the views.publish method using the built-in WebClient
        const result = await app.client.views.publish({
          // The token you used to initialize your app is stored in the `context` object
          token: context.botToken,
          user_id: userId,
          view: {
            // Home tabs must be enabled in your app configuration page under "App Home"
            "type": "home",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `*Welcome home, <@${  userId  }> :house:*`
                }
              },
              {
                  "type": "section",
                  "text": {
                      "type": "mrkdwn",
                      "text": "Hey there 👋 I'm Alti. I'm here to help you smoothly enter and exit your workflow! Get started by choosing a channel to set up with :)"
                  }
              },
              {
                  "type": "section",
                  "text": {
                      "type": "mrkdwn",
                      "text": "*Pick a channel* to add me to and I'll introduce myself and start pairing people up. I'm usually added to a team or project channel. \n Note: You can only have one pairing channel."
                  },
                  "accessory": {
                      "type": "channels_select",
                      "action_id": "pairing_channel_selected",
                      "placeholder": {
                          "type": "plain_text",
                          "text": "Select a channel...",
                          "emoji": true
                      },
                      "confirm": 
                        {
                            "title": {
                                "type": "plain_text",
                                "text": "Are you sure?"
                            },
                            "text": {
                                "type": "plain_text",
                                "text": "Designate this as the pairing channel?"
                            },
                            "confirm": {
                                "type": "plain_text",
                                "text": "Do it"
                            },
                            "deny": {
                                "type": "plain_text",
                                "text": "Stop, I've changed my mind!"
                            }
                        }
                  }
              },
              {
                  "type": "divider"
              },
              {
                  "type": "context",
                  "elements": [
                      {
                          "type": "mrkdwn",
                          "text": "or... do `/setup` to create an #alti-pair channel with everyone in the workspace\n"
                      }
                  ]
              },
              {
                "type": "divider"
              },
              {
                  "type": "section",
                  "text": {
                      "type": "plain_text",
                      "text": "Warm Up Channels You're In",
                      "emoji": true
                  }
              },    
              {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Channels",
                    "emoji": true
                }
              },   
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Pick a daily warm up time!"
                }
              },
              {
                "type": "actions",
                "block_id": "warm up block",
                "elements": [
                  {
                    "type": "static_select",
                    "action_id": "warmup_time1_selected",
                    "placeholder": {
                      "type": "plain_text",
                      "text": "Select a time",
                      "emoji": true
                    },
                    "options": appHomeObjects.times
                  },
                  {
                    "type": "static_select",
                    "action_id": "warmup_time2_selected",
                    "placeholder": {
                      "type": "plain_text",
                      "text": "AM/PM",
                      "emoji": true
                    },
                    "options": appHomeObjects.ampm
                  },
                  {
                    "type":"button",
                    "action_id":"warmup_time_set_button",
                    "text":{
                        "type":"plain_text",
                        "text":"set",
                        "emoji":true
                    }
                  },
                ]
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Pick a daily cooldown time!"
                }
              },
              {
                "type": "actions",
                "block_id": "cooldown block",
                "elements": [
                  
                  {
                    "type": "static_select",
                    "action_id": "cooldown_time1_selected",
                    "placeholder": {
                      "type": "plain_text",
                      "text": "Select a time",
                      "emoji": true
                    },
                    "options": appHomeObjects.times
                  },
                  {
                    "type": "static_select",
                    "action_id": "cooldown_time2_selected",
                    "placeholder": {
                      "type": "plain_text",
                      "text": "AM/PM",
                      "emoji": true
                    },
                    "options": appHomeObjects.ampm
                  },
                  {
                    "type":"button",
                    "action_id":"cooldown_time_set_button",
                    "text":{
                        "type":"plain_text",
                        "text":"set",
                        "emoji":true
                    }
                  },
                ]
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "or... set custom times for each day!"
                },
                "accessory": {
                  "type":"button",
                  "action_id": "set_custom_times",
                  "text":{
                      "type":"plain_text",
                      "text":"customize",
                      "emoji":true
                  }
                }
              },
              {
                "type": "context",
                "elements": [
                  {
                    "type": "mrkdwn",
                    "text": "Psssst this home tab was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
                  }
                ]
              }
            ]
          }
        });
    
      }
      catch (error) {
        console.error(error);
      }

}




