//require('@google-cloud/trace-agent').start({});
// require('@google-cloud/profiler').start({
// 	serviceContext: {
// 	  service: 'warmup_messages',
// 	  version: '1.0.0',
// 	},
// 	logLeveL: 3,
// });
const index = require('./index');
const quotes = require('./quotes');
const app = index.getBolt();
const firestoreFuncs = require('./firestore');
const motivationalQuotes = quotes.getQuotesObj();
const generateData = require('./generateTaskData');
sendSelectWarmupChoice = async function(ack,body,context){
	//warmup selection message json
	let warmupView = createSelectionView(true);

	//try function logic
	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.views.open({
		  // The token you used to initialize your app is stored in the `context` object
			token: context.botToken,
			trigger_id: body.trigger_id,
			view: JSON.stringify(warmupView)
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
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
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
				block_id: "num",
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
 await ack();
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
	  }
  }
  //gets teamID from the action which functions as workspace id
  const teamID = body['team']['id'];
  //gets the userID from the action
  const userID = body['user']['id'];
  //console.log used for local testing
  //console.log(userID + " in " + channelID + " sent the following: " + msgToSend+ "in team:"+ teamID);
  //writes the data collected to the firebase
  let text = "Here's a custom message from your buddy: '" + msgToSend+ "'";
  var storeReturn = firestoreFuncs.storeTypeOfExercise(teamID, userID, isWarmup, text);
  let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the custom message tomorrow!*");
  try {
		const result = await app.client.views.open({
			token: context.botToken,
			trigger_id: body.trigger_id,
			view: JSON.stringify(confirmationJSON)
		});
  }
  catch (error) {
	console.error(error);
  }
  return storeReturn;
}


sendSelectCooldownChoice = async function(ack,body,context){
	//try function logic
	let cooldownView = createSelectionView(false);
	//try function logic
	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.views.open({
		  // The token you used to initialize your app is stored in the `context` object
			token: context.botToken,
			trigger_id: body.trigger_id,
			view: JSON.stringify(cooldownView)
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}

exports.cooldownRetroSelect = async function(ack,body,context) {
	ack();
	let refArray = []; //array with quote author names
	let valArray = []; //array with quote values
	let amountOfRetros = 6; 
	for (var retroGenerationIter = 0; retroGenerationIter < amountOfRetros; retroGenerationIter++) {
		let retroGenerated = generateData.generateRetro();
		//cut the index out of the quote generated
		let index = retroGenerated.substr(0, retroGenerated.indexOf('-')); 
		retroGenerated = retroGenerated.substr(retroGenerated.indexOf('-')); 
		valArray[retroGenerationIter] = index;
		refArray[retroGenerationIter] = retroGenerated;
	}
	let thisView = createModalView("Alti","generic_close","cooldown_retro_selected_ack","Nice, retros are fun!","Pick an article type","num",refArray,valArray);
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
         view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}


exports.cooldownVideoSelect = async function(ack,body,context) {
	await ack();
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'cooldown_video_selected_ack',
			title: {
			  type: 'plain_text',
			  text: 'Video Selection'
			},
			blocks: [
			  {
				type: 'input',
				block_id: 'num',
				label: {
				  type: 'plain_text',
				  text: 'Submit your non-tech video link below!'
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


exports.cooldownArticleSelect = async function(ack,body,context) {
	await ack();
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'cooldown_article_selected_ack',
			title: {
			  type: 'plain_text',
			  text: 'Article Selection'
			},
			blocks: [
			  {
				type: 'input',
				block_id: 'num',
				label: {
				  type: 'plain_text',
				  text: 'Submit your non-tech article link below!'
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

exports.requestCustomSendCooldown = async function(ack,body,context) {
	await ack();
	//console.log(body.channel.id);
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
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
				block_id: "num",
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
await ack({	 "response_action": "clear" });
	console.log(body);
	let thisView = createModalView("Alti","generic_close","warmup_typing_selected_ack","Nice, warmup typing challenges are awesome!",
											"Pick a language","num",["Python","JS","C++","C","Java", "English"],
											["python","javascript", "c++","c","java","english"]);
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.warmupPuzzleSelect = async function(ack,body,context) {
	await ack({ "response_action": "clear"});
	let thisView = createModalView("Alti","generic_close","warmup_puzzle_selected_ack","Awesome puzzles are fun!","Pick a puzzle","num",["Hitori","Sudoku","Calcudoku", "3 in a Row"],["hitori","sudoku", "calcudoku", "3inarow"]);
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		view_id: body.view.id,
		trigger_id: body.trigger_id,
        view: JSON.stringify(thisView)
      });
    }
    catch (error) {
      console.error(error);
    }
}

exports.warmupArticleSelect = async function(ack,body,context) {
	await ack({ "response_action": "clear"});
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
        view: {
			type: 'modal',
			// View identifier
			callback_id: 'warmup_article_selected_ack',
			title: {
			  type: 'plain_text',
			  text: 'Warmup Article Input'
			},
			blocks: [
			  {
				type: 'input',
				block_id: "num",
				label: {
				  type: 'plain_text',
				  text: 'Submit your article link below!'
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


exports.warmupQuoteSelect = async function(ack,body,context) {
	ack({ "response_action": "clear"});
	let refArray = []; //array with quote author names
	let valArray = []; //array with quote values
	let amountOfQuotes = 6; 
	for (var quoteGenerationIter = 0; quoteGenerationIter < amountOfQuotes; quoteGenerationIter++) {
		let quoteGenerated = generateData.generateQuote();
		//cut the index out of the quote generated
		let index = quoteGenerated.substr(0, quoteGenerated.indexOf('-')); 
		quoteGenerated = quoteGenerated.substr(quoteGenerated.indexOf('-')); 
		valArray[quoteGenerationIter] = index;
		refArray[quoteGenerationIter] = quoteGenerated;
	}
	
	//generate values for above array
	let thisView = createModalView("Alti","generic_close","warmup_quote_selected_ack","Great choice quotes are fun!","Pick an author","num",refArray,valArray);
	// console.log(JSON.stringify(thisView));
    try {
      const result = await app.client.views.update({
        token: context.botToken,
		trigger_id: body.trigger_id,
		view_id: body.view.id,
        view: JSON.stringify(thisView)
	  });
    }
    catch (error) {
      console.error(error);
    }
}

exports.sendExercisePrompt = async function(workspaceId, userId, dmThreadID, isWarmup, context) {
	// retrieves warmup prompt for the user that called this slash command, and sends in the DM thread
	let prompt = await firestoreFuncs.getExercisePrompt(workspaceId, userId, isWarmup);

	try {
		//make a call to the web api to post message in targ channel
		const result = await app.client.chat.postMessage({
			// The token you used to initialize your app is stored in the `context` object
			token: context.botToken,
			channel: dmThreadID,
			text: prompt
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}


createSelectionView = function(isWarmupSelection){
	let newView = {};
	//begin populating view object with properties
	newView["type"] = "modal";
	if (isWarmupSelection) {
		newView["callback_id"] = "closedSelectionWarmup";
	}
	else {
		newView["callback_id"] = "closedSelectionCooldown";
	}
	
	
	//create title of view properties
	let titleObj = {};
	titleObj["type"] = "plain_text";
	if (isWarmupSelection) {
		titleObj["text"] = "Warmup Selection";
	} else {
		titleObj["text"] = "Cooldown Selection";
	}
	titleObj["emoji"] = true;
	newView["title"] = titleObj;
	
	let closeObj = {};
	closeObj["type"] = "plain_text";
	closeObj["text"] = "Close";
	closeObj["emoji"] = true;
	
	newView["close"] = closeObj;
	
	if (isWarmupSelection) {
		newView["blocks"] = [
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
						"text": "*Speed Typing Test*"
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
	} else {
		newView["blocks"] = [
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
	}
	
	return newView;
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
	
	
	//create close view properties
	let closeObj = {};
	closeObj["type"] = "plain_text";
	closeObj["text"] = "Close";
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
	
	//iterate through arrays to generate options
	var amountOfChoices = choiceRepArray.length;
	for (var choiceIterator = 0; choiceIterator < amountOfChoices; choiceIterator++) {
		let newBlock = {};
		newBlock["type"] = "section";
		let newText = {};
		newText["type"] = "plain_text";
		newText["text"] = choiceRepArray[choiceIterator];
		
		let newAccessory = {};
		newAccessory["action_id"]= actionID;
		newAccessory["type"]= "button";
		newAccessory["value"]= choiceValueArray[choiceIterator];
		
		let newAccessoryText = {};
		newAccessoryText["type"] = "plain_text";
		newAccessoryText["text"] = "Choose";
		
		newAccessory["text"] = newAccessoryText;
		
		newBlock["text"] = newText;
		newBlock["accessory"] = newAccessory;
		
		blocksObj.push(newBlock);
	}
	//place blocks object into view
	newView["blocks"] = blocksObj;
	
	return newView;
}	
    
/*
createConfirmationView
Creates a json modal view with specified arguments.

title (string) - title of modal (been using "Alti" for now)
choiceText (string) - string prompting a user to select something


returns (json)

*/
createConfirmationView = function(title,confirmationText) {
	let newView = {};
	//begin populating view object with properties
	newView["type"] = "modal";
	newView["callback_id"] = "confirmation";
	//create title of veiew properties
	let titleObj = {};
	titleObj["type"] = "plain_text";
	titleObj["text"] = title;
	titleObj["emoji"] = true;
	
	newView["title"] = titleObj;
	
	
	//create close view properties
	let closeObj = {};
	closeObj["type"] = "plain_text";
	closeObj["text"] = "Close";
	closeObj["emoji"] = true;
	newView["close"] = closeObj;
	
	let blocksObj = [];
	
	let descriptionBlock = {};
	descriptionBlock["type"] = "section"
	descrTextObj = {};
	descrTextObj["type"] = "mrkdwn";
	descrTextObj["text"] = confirmationText;
	
	descriptionBlock["text"] = descrTextObj;

	//push this block onto blocks obj
	blocksObj.push(descriptionBlock);

	newView["blocks"] = blocksObj;
	
	return newView;
}	
 
//handles asynchrounous handling of confirmation for selection 
handleQuoteSelect = async function(ack,body,context) {
	await ack({ "response_action": "clear"});
	// console.log(body.actions[0]);
	let quoteID = body.actions[0].value;
	let quoteText = motivationalQuotes[quoteID].text;
	let quoteAuthor = motivationalQuotes[quoteID].author;
	if (quoteAuthor === null) {
		quoteAuthor = "Unknown";
	}
	var text = generateData.generateMessageToSend('quote', [quoteAuthor, quoteText]);
	// console.log(body);
	var workspaceId = body.team.id;
	var userId = body.user.id;
	await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, true, text);

	
	let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the motiviational quote for warmup tomorrow!*");
    try {
		if(body.view.id !== undefined){
			//push new view above old
			const result = await app.client.views.update({
				token: context.botToken,
				view_id: body.view.id,
				view: JSON.stringify(confirmationJSON)
			});
		}
    }
    catch (error) {
      console.error(error);
    }
}

handlePuzzleSelect = async function(ack,body,context) {
	await ack({ "response_action": "clear"});
	var action = body.actions[0];
	var puzzleType = action.value;
	var text = generateData.generateMessageToSend('puzzle', puzzleType);

	// console.log(text);
	var workspaceId = body.team.id;
	var userId = body.user.id;
	var storeReturn = await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, true, text);
		let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the puzzle for warmup tomorrow!*");
    try {
		if(body.view.id !== undefined){
		//push new view above old
			const result = await app.client.views.update({
				token: context.botToken,
				view_id: body.view.id,
				view: JSON.stringify(confirmationJSON)
			});
		}
    }
    catch (error) {
      console.error(error);
	}
	return storeReturn;
}
handleTypingSelect = async function(ack,body,context) {
	await ack({ "response_action": "clear"});
	var action = body.actions[0];
	var language = action.value;

	var text = generateData.generateMessageToSend('typing', language);

	var workspaceId = body.team.id;
	var userId = body.user.id;
	var storeReturn = await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, true, text);
	let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the typing challenge for warmup tomorrow!*");
    try {
		//push new view above old
		if(body.view.id !== undefined){
			const result = await app.client.views.update({
				token: context.botToken,
				view_id: body.view.id,
				view: JSON.stringify(confirmationJSON)
			});
		}
    }
    catch (error) {
      console.error(error);
	}
	return storeReturn;
}
 
handleRetroSelect = async function(ack,body,context) {
	await ack();
	var action = body.actions[0];
	var language = action.value;

	var text = generateData.generateMessageToSend('retro', language);

	var workspaceId = body.team.id;
	var userId = body.user.id;
	var storeReturn = await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, false, text);
	let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the retro for their cooldown tomorrow!*");
    try {
		//push new view above old
		if(body.view.id !== undefined){
			const result = await app.client.views.update({
				token: context.botToken,
				view_id: body.view.id,
				view: JSON.stringify(confirmationJSON)
			});
		}
    }
    catch (error) {
      console.error(error);
	}
	return storeReturn;
}
 
 
//handles asynchrous handling of confirmation of article selection
handleArticleSelect = async function(view,ack,body,context) {
	ack({
	  //clear the modal off the users screen
	 "response_action": "clear"
	});
	// get a  reference to the view object's values
	const valuesObject = view['state']['values']
	let quoteToSend = ''
	let counter = 0; 
	//obtain the first key in the values object and use it to grab the user input 
	//as well as the channel the user wants to send the input to
	for (key in valuesObject) {
	  if (counter === 0) {
		quoteToSend += valuesObject[key]['input_text']['value'];
		counter++;
	  }
	}
	//gets teamID from the action which functions as workspace id
	const workspaceId = body['team']['id'];
	//gets the userID from the action
	const userId = body['user']['id'];
	var text = generateData.generateMessageToSend('article', quoteToSend);
	var storeReturn = await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, true, text);
	let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the article for warmup tomorrow!*");
    try {
			const result = await app.client.views.open({
				token: context.botToken,
				view_id: body.view.id,
				trigger_id: body.trigger_id,
				view: JSON.stringify(confirmationJSON)
			});
    }
    catch (error) {
      console.error(error);
	}
	return storeReturn;
}

//handles asynchrous handling of confirmation of cooldown article selection
handleCooldownArticleSelect = async function(view,ack,body,context) {
	ack();
	// get a  reference to the view object's values
	const valuesObject = view['state']['values']
	let quoteToSend = ''
	let counter = 0; 
	//obtain the first key in the values object and use it to grab the user input 
	//as well as the channel the user wants to send the input to
	for (key in valuesObject) {
	  if (counter === 0) {
		quoteToSend += valuesObject[key]['input_text']['value'];
		counter++;
	  }
	}
	//gets teamID from the action which functions as workspace id
	const workspaceId = body['team']['id'];
	//gets the userID from the action
	const userId = body['user']['id'];
	var text = generateData.generateMessageToSend('cooldownArticle', quoteToSend); //TODO UPDATE
	var storeReturn = await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, false, text);
	let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the article for cooldown tomorrow!*");
    try {
			const result = await app.client.views.open({
				token: context.botToken,
				view_id: body.view.id,
				trigger_id: body.trigger_id,
				view: JSON.stringify(confirmationJSON)
			});
    }
    catch (error) {
      console.error(error);
	}
	return storeReturn;
}

//handles asynchrous handling of confirmation of cooldown video selection
handleVideoSelect = async function(view,ack,body,context) {
	ack();
	// get a  reference to the view object's values
	const valuesObject = view['state']['values'];
	let quoteToSend = ''
	let counter = 0; 
	//obtain the first key in the values object and use it to grab the user input 
	//as well as the channel the user wants to send the input to
	for (key in valuesObject) {
	  if (counter === 0) {
		quoteToSend += valuesObject[key]['input_text']['value'];
		counter++;
	  }
	}
	//gets teamID from the action which functions as workspace id
	const workspaceId = body['team']['id'];
	//gets the userID from the action
	const userId = body['user']['id'];
	var text = generateData.generateMessageToSend('video', quoteToSend);
	var storeReturn = await firestoreFuncs.storeTypeOfExercise(workspaceId, userId, false, text);
	let confirmationJSON = createConfirmationView("Alti-Confirmation","*Your buddy will receive the video for cooldown tomorrow!*");
    try {
			const result = await app.client.views.open({
				token: context.botToken,
				view_id: body.view.id,
				trigger_id: body.trigger_id,
				view: JSON.stringify(confirmationJSON)
			});
    }
    catch (error) {
      console.error(error);
	}
	return storeReturn;
}


app.action('warmup_quote_selected_ack', ({ ack, body, context }) => {
	handleQuoteSelect(ack,body,context);
});

 app.action('warmup_puzzle_selected_ack', ({ ack, body, context }) => {
	handlePuzzleSelect(ack,body,context);
 });
 app.action('warmup_typing_selected_ack', ({ ack, body, context }) => {
	handleTypingSelect(ack,body,context);
 });
 app.view('warmup_article_selected_ack', ({ view, ack, body, context }) => {
	handleArticleSelect(view,ack,body,context);
 });
  app.action('cooldown_retro_selected_ack', ({ ack, body, context }) => {
	handleRetroSelect(ack,body,context);
 });
 app.view('cooldown_article_selected_ack', ({ view, ack, body, context }) => {
	handleCooldownArticleSelect(view,ack,body,context);
 });
 app.view('cooldown_video_selected_ack', ({ view, ack, body, context }) => {
	handleVideoSelect(view,ack,body,context);
 });

//sends a get warmup button to a channel
exports.sendGetWarmupButton = async function(targChannelID,app,token) {
	//notification to be sent when button is posted into chat
	const notificationString = "Your warmup is ready!";
	//button blocks object.
	const getterButton = [
		{
			"type": "actions",
			"elements": [
				{
					"action_id": "getMyWarmupClick",
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Get your warmup!",
						"emoji": true
					}
				}
			]
		}
	];
	//try function logic
	try {
		//make a call to the web api to post button in targ channel
		const result = await app.client.chat.postMessage({
		  token: token,
		  channel: targChannelID,
		  text: notificationString,
		  blocks: getterButton
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
	
}

exports.sendWarmupButton = async function(targChannelID,app,token){
	const notificationString = "Alert to send a warmup to your buddy!";
		const warmupButton = [
		{
			"type": "actions",
			"elements": [
				{
					"action_id": "sendWarmupButtonClick",
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Send A Warmup",
						"emoji": true
					}
				}
			]
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
		  blocks: warmupButton
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}	


//sends a cooldown button to a target channel 
exports.sendCooldownButton = async function(targChannelID,app,token){
	const notificationString = "Alert to send a cooldown to your buddy!";
		const warmupButton = [
		{
			"type": "actions",
			"elements": [
				{
					"action_id": "sendCooldownButtonClick",
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Send A Cooldown",
						"emoji": true
					}
				}
			]
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
		  blocks: warmupButton
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}	

//sends a warmup modal to the user with their prompt   
sendMyWarmup = async function(body, context){
	let prompt = await firestoreFuncs.getExercisePrompt(body.user.team_id, body.user.id, true);
	try {
		if (prompt === undefined) {
			prompt = "no message sent";
		}
		const promptJSON = createConfirmationView("Warmup",prompt);
		//make a call to the web api to post the promp as a modal
		const result = await app.client.views.open({
			token: context.botToken,
			trigger_id: body.trigger_id,
			view: JSON.stringify(promptJSON)
		});
	}
	//catch any errors
	catch(error) {
		console.log(error);
	}
}

//handles calling function to send warmup choice modal to context while acknoledges event calling function
sendWarmupHandler = async function(ack,body,context) {
	ack();
	sendSelectWarmupChoice(ack,body, context);
}

//handles calling function to send cooldown choice modal to context while acknoledges event calling function
sendCooldownHandler = async function(ack,body,context) {
	ack();
	sendSelectCooldownChoice(ack,body, context);
}

//listen for and acknowledge a sendCooldownButtonClick Action and handle by calling the sendCooldownHandler
app.action('sendCooldownButtonClick', ({ ack, body, context }) => {
	sendCooldownHandler(ack,body,context);
});
 
 
//listen for and acknowledge a sendWarmupButtonClick Action and handle by calling the sendWarmupHandler
app.action('sendWarmupButtonClick', ({ ack, body, context }) => {
	sendWarmupHandler(ack,body,context);
});

//listen for and acknowledge a getMyWarmupClick Action and handle by calling the sendMyWarmup function
app.action('getMyWarmupClick', ({ack,body,context }) => {
	ack(); //acknowledge the click 
	sendMyWarmup(body,context);
	
});

app.action('confirmation', ({view, ack, body, context }) => {
	ack({
		 "response_action": "clear"
	});
});

