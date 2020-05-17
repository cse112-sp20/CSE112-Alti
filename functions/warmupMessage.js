const index = require('./index');
const quotes = require('./quotes');
const {app,token} = index.getBolt();
const firestoreFuncs = require('./firestore');
const motivationalQuotes = quotes.getQuotesObj();
const generateData = require('./generateTaskData');
exports.sendSelectChoice = async function(targChannelID,app,token){
	const notificationString = "Send a warmup to your buddy!"
	//warmup selection message json
	const warmupSelect = [
			{
				"type": "section",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Hey there, pick a warmup for your buddy!"
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Pick a content type:*"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Code Speed Typing Test*"
				},
				"accessory": {
					"action_id": "warmup_coding_select",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_test"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Tech Article*"
				},
				"accessory": {
					"action_id": "warmup_article_select",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_article"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Easy Online Puzzle*"
				},
				"accessory": {
					"action_id": "warmup_puzzle_select",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_puzzle"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Motivational Quote*"
				},
				"accessory": {
					"action_id": "warmup_quote_select", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_quote"
				}
			},
			 {
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Custom Message*"
				},
				"accessory": {
					"action_id": "request_custom_send", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_custom"
				}
			}
		];
	//try function logic
	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.chat.postMessage({
		  // The token you used to initialize your app is stored in the `context` object
		  token: token,
		  channel: targChannelID,
		  text: notificationString,
		  blocks: warmupSelect
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}

exports.requestCustomSend = async function(ack,body,context) {
	await ack();
	//console.log(body.channel.id);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'custom_msg_view',
			title: {
			  type: 'plain_text',
			  text: 'Custom Message Warmup'
			},
			blocks: [
			  {
				type: 'input',
				block_id: body.channel.id,
				label: {
				  type: 'plain_text',
				  text: 'Enter your custom message here below.'
				},
				element: {
				  type: 'plain_text_input',
				  action_id: 'input_text',
				  multiline: true
				}
			  }
			],
			submit: {
			  type: 'plain_text',
			  text: 'Submit'
			}
		  }
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.customMsgView =  async function(ack, body, view, context, isWarmup) {
	  // Acknowledge the custom_msg_view event
  ack({
	  //clear the modal off the users screen
	 "response_action": "clear"
  });
  // get a  reference to the view object's values
  const valuesObject = view['state']['values']
  let msgToSend = ''
  let counter = 0;
  let channelID = "";
  //obtain the first key in the values object and use it to grab the user input 
  //as well as the channel the user wants to send the input to
  for (key in valuesObject) {
	  if (counter === 0) {
		msgToSend += valuesObject[key]['input_text']['value'];
		counter++;
		channelID=key;
	  }
  }
  //gets teamID from the action which functions as workspace id
  const teamID = body['team']['id'];
  //gets the userID from the action
  const userID = body['user']['id'];
  //console.log used for local testing
  //console.log(userID + " in " + channelID + " sent the following: " + msgToSend+ "in team:"+ teamID);
  //writes the data collected to the firebase
  firestoreFuncs.writeMsgToDB(teamID, userID, channelID,msgToSend,isWarmup);
}


exports.sendSelectCooldownChoice = async function(targChannelID,app,token){
	const notificationString = "Send a cool-down to your buddy!"
	//warmup selection message json
	const cooldownSelect = [
			{
				"type": "section",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": 'Which cool-down would you like to send your buddy to get them out of "the zone" this afternoon?'
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Options:*"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Custom Message*"
				},
				"accessory": {
					"action_id": "cooldown_custom_select",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_custom"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Retrospective Questions*"
				},
				"accessory": {
					"action_id": "cooldown_retro_select",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_retro"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Non-tech Article*"
				},
				"accessory": {
					"action_id": "cooldown_article_select",
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_article"
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*Non-tech Video*"
				},
				"accessory": {
					"action_id": "cooldown_video_select", 
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Choose"
					},
					"value": "select_video"
				}
			}
		];
	//try function logic
	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.chat.postMessage({
		  // The token you used to initialize your app is stored in the `context` object
		  token: token,
		  channel: targChannelID,
		  text: notificationString,
		  blocks: cooldownSelect
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}

exports.cooldownRetroSelect = async function(ack,body,context) {
	await ack();
		let thisView = createModalView("Alti","generic_close","generic_ack","Nice, retros are fun!","Pick an article type",body.channel.id,["memes","more memes","dreans"],["1","2", "3"]);

    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
         view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}


exports.cooldownVideoSelect = async function(ack,body,context) {
	await ack();
	let thisView = createModalView("Alti","generic_close","generic_ack","Nice, cooldown articles are fun!","Pick an article type",body.channel.id,["memes","more memes","dreans"],["1","2", "3"]);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}


exports.cooldownArticleSelect = async function(ack,body,context) {
	await ack();
	let thisView = createModalView("Alti","generic_close","generic_ack","Nice, cooldown articles are fun!","Pick an article type",body.channel.id,["memes","more memes","dreans"],["1","2", "3"]);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.requestCustomSendCooldown = async function(ack,body,context) {
	await ack();
	//console.log(body.channel.id);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'custom_msg_view_cooldown',
			title: {
			  type: 'plain_text',
			  text: 'Custom Message Cooldown'
			},
			blocks: [
			  {
				type: 'input',
				block_id: body.channel.id,
				label: {
				  type: 'plain_text',
				  text: 'Enter your custom message here below.'
				},
				element: {
				  type: 'plain_text_input',
				  action_id: 'input_text',
				  multiline: true
				}
			  }
			],
			submit: {
			  type: 'plain_text',
			  text: 'Submit'
			}
		  }
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.warmupCodingSelect = async function(ack,body,context) {
	await ack();
	let thisView = createModalView("Alti","generic_close","generic_ack","Nice, warmup coding challenges are awesome!","Pick a language",body.channel.id,["C","C++","C#"],["1","2", "3"]);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.warmupPuzzleSelect = async function(ack,body,context) {
	await ack();
	let thisView = createModalView("Alti","generic_close","warmup_puzzle_selected_ack","Awesome puzzles are fun!","Pick a puzzle",body.channel.id,["Hitori","Sudoku","Calcudoku"],["1","2", "3"]);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.warmupArticleSelect = async function(ack,body,context) {
	await ack();
	let thisView = createModalView("Alti","generic_close","generic_ack","Great choice articles are fun!","Pick a topic",body.channel.id,["code","server","ml"],["1","2", "3"]);
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.warmupQuoteSelect = async function(ack,body,context) {
	ack();
	let refArray = []; //array with quote author names
	let valArray = []; //array with quote values
	let amountOfQuotes = 6; 
	//generate values for above array
	generateQuoteArray(amountOfQuotes,refArray,valArray);
	let thisView = createModalView("Alti","generic_close","warmup_quote_selected_ack","Great choice quotes are fun!","Pick an author",body.channel.id,refArray,valArray);
	// console.log(JSON.stringify(thisView));
    try {
      const result = await app.client.views.open({
        token: context.botToken,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
	  });
    }
    catch (error) {
      console.error(error);
    }
}


generateQuoteArray = function(arrayLen, repRefArray, repValArray){ 
	for (var quoteGenIndex = 0; quoteGenIndex < arrayLen; quoteGenIndex++) {
		generateQuote(quoteGenIndex,repRefArray,repValArray);
	}
}

generateQuote = function(index,repRefArray,repValArray) {
	let quotePoolSize =  Object.keys(motivationalQuotes).length;
	let randomQuoteIndex = Math.floor(Math.random() * quotePoolSize);
	let quoteText = motivationalQuotes[randomQuoteIndex].text; 
	let quoteAuthor =  motivationalQuotes[randomQuoteIndex].author;	
	if (quoteAuthor === null) {
		quoteAuthor = "Unknown";
	}
	repRefArray[index] = quoteAuthor;
	repValArray[index] = randomQuoteIndex.toString();
}
/*
createModalView
Creates a json modal view with specified arguments.

title (string) - title of modal (been using "Alti" for now)
callbackID (string) - an id that the app can listen for to respond to the submission of this modal
actionID (string) - an id that the app can listen for to respond to the selection of choices within this modal
responseText (string) - text that greets the user within the modal
choiceText (string) - string prompting a user to select something
channelID (slackID) - id of a the channel this model was triggered from
choiceRepArray (array of strings) - an array of the names of options the user can select from in the pulldown
choiceValueArray (array of strings) - an array of the values of the options the user can choose from

example for the last two arguments, the choiceRepArray would contain names of puzzles, the  choiceValueArray
would contain strings with links to said puzzle types. 

returns (json)

TODO HANDLE INVALID INPUT
*/
createModalView = function(title,callbackID,actionID,responseText,choiceText,channelID, choiceRepArray, choiceValueArray) {
	let newView = {};
	//begin populating view object with properties
	newView["type"] = "modal";
	newView["callback_id"] = callbackID;
	
	//create title of view properties
	let titleObj = {};
	titleObj["type"] = "plain_text";
	titleObj["text"] = title;
	titleObj["emoji"] = true;
	
	newView["title"] = titleObj;
	
	//create submit view properties
	let submitObj = {};
	submitObj["type"]= "plain_text";
	submitObj["text"] = "Submit";
	submitObj["emoji"] = true;
	
	newView["submit"] = submitObj;
	
	//create close view properties
	let closeObj = {};
	closeObj["type"] = "plain_text";
	closeObj["text"] = "Cancel";
	closeObj["emoji"] = true;
	
	newView["close"] = closeObj;
	
	let blocksObj = [];
	
	let descriptionBlock = {};
	descriptionBlock["type"] = "section"
	descrTextObj = {};
	descrTextObj["type"] = "mrkdwn";
	descrTextObj["text"] = responseText;
	
	descriptionBlock["text"] = descrTextObj;
	descriptionBlock["block_id"] = channelID;
	
	//push this block onto blocks obj
	blocksObj.push(descriptionBlock);
	
	
	//create choice object
	let choiceObj = {};
	choiceObj["type"] = "section";
	choiceObj["block_id"]= "choiceSelection";
	
	let choiceTextField = {} 
	choiceTextField["type"] = "mrkdwn";
	choiceTextField["text"] = choiceText;
	//append text to choice obj
	choiceObj["text"] = choiceTextField;
	
	let choiceAccessory = {};
	choiceAccessory["action_id"]= actionID;
	choiceAccessory["type"] = "static_select";
	
	let placeholder = {};
	placeholder["type"]= "plain_text";
	placeholder["text"] = "Option"
	choiceAccessory["placeholder"] = placeholder;
	//append accesory to choice obj
	
	
	let options = [];
	
	//iterate through arrays to generate options
	var amountOfChoices = choiceRepArray.length;
	for (var choiceIterator = 0; choiceIterator < amountOfChoices; choiceIterator++) {
		let newOption = {};
		let newText = {};
		newText["type"] = "plain_text";
		newText["text"] = choiceRepArray[choiceIterator];
		newOption["text"] = newText;
		newOption["value"] = choiceValueArray[choiceIterator];
		options.push(newOption);
	}
	choiceAccessory["options"]  = options;
	//add options to choice object
	choiceObj["accessory"] = choiceAccessory;
	//push choice object into the blocks object
	blocksObj.push(choiceObj);
	//place blocks object into view
	newView["blocks"] = blocksObj;
	
	return newView;
}	
   

app.action('warmup_quote_selected_ack', ({ ack, body, context }) => {
	ack();
	const selected_option = body.actions[0].selected_option;
	const selected_quote = motivationalQuotes[selected_option.value];
	const author = selected_quote.author;
	const text = selected_quote.text;
	const data = generateData.generateMessageToSend('quote', selected_quote);
	console.log(data);
	// console.log(text);
	var quoteIndex = selected_option.value;
	// var quote = motivationalQuotes[]
 });

 app.action('warmup_puzzle_selected_ack', ({ ack, body, context }) => {
	ack();
	const selected_option = body.actions[0].selected_option;
	// const selected_quote = motivationalQuotes[selected_option.value];
	// const author = selected_quote.author;
	// const text = selected_quote.text;
	// const data = generateData.generateMessageToSend('quote', selected_quote);
	console.log(selected_option);
	// console.log(text);
	var quoteIndex = selected_option.value;
	// var quote = motivationalQuotes[]
 });