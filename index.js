const { App } = require('@slack/bolt');

const slack = new App({
    token: 'xoxb-1109790171392-1110712837169-OxF8igcVuxkFUhbZVuoXxypj',
    signingSecret: '7a93a02fb7880f4e375903487fa77fcd' //process.env.SLACK_SIGNING_SECRET
    
});

// Listens to incoming messages that contain "hello"
slack.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await slack.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();