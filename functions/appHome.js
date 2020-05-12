exports.appHome = async function appHome(app, payload, context) {
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
                      "text": "*Pick a channel* to add me to and I'll introduce myself and start pairing people up. I'm usually added to a team or project channel."
                  },
                  "accessory": {
                    "action_id": "select",
                      "type": "channels_select",
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
                  "type": "section",
                  "text": {
                      "type": "plain_text",
                      "text": "Warm Up Channels You're In",
                      "emoji": true
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