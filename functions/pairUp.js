require('@google-cloud/trace-agent').start({
    projectId: 'altitest-5f53d',
});
require('@google-cloud/profiler').start({
	serviceContext: {
      projectId: 'altitest-5f53d',
	  service: 'pair_up',
	  version: '1.0.0',
	},
	logLeveL: 3,
});
const shuffle = require('shuffle-array');
const firestoreFuncs = require('./firestore');
const index = require('./index');
const app = index.getBolt();
const util = require('./util');
// Triggers the pairing up of all people in a given channel.
exports.pairUp = async function pairUp(context=undefined, botToken=undefined){
    
    if(context === undefined && botToken === undefined){
        throw new Exception("Both the context and bot token is undefined. Cannot pair up.")
    }
    try{
        if(context !== undefined){
            token = context.botToken;
        }
        else{
            token = botToken;
        }
        // TODO: Take this out of this function and pass it in as a parameter ideally
        const workspaceInfo = await app.client.team.info({
            token: token
        })
        const allUsers = app.client.users.list({
            token: token
        });

        const channelId = firestoreFuncs.getPairingChannel(workspaceInfo.team.id);
        var pairingChannelIdVal;
        // const workspaceInfo = await workspaceInfoPromise.then(result => result.data);

        const members = channelId.then( id => {
            pairingChannelIdVal = id;
            return app.client.conversations.members({
                    token:token,
                    channel:id
            });
        });
        
        const usersInfo = await Promise.all([allUsers, members]).then(data => {
            const allUsers = data[0];
            const members = data[1];
            const membersList = members.members;
            const selectedUsers = allUsers.members.filter( user => membersList.includes(user.id));
            return Promise.resolve(selectedUsers);
        });

        // Get all the necessary user ids
        const ids = await Promise.all(usersInfo).then( users => {
            // console.log(usersInfo)
            // const users = usersInfo.map( info => info.user);
            const humans = users.filter( user => {
                //SlackBot is also excluded. Filters non-humans
                return !user.is_bot && user.id!=='USLACKBOT';
            });
            if(humans.length <= 1){
                console.error("Could not pair since there is less than 2 people in the workspace");
                return undefined;
            }
            var ids = humans.map( human => {
                return human.id;
            });
            // Randomize the order of people
            shuffle(ids);
            return ids
        }); 
        //Pairing people up randomly and saving the response containing the paired channel information
        conversationInfos = []
        for (i = 0; i < ids.length/2; i++) {
            var responsePromise = app.client.conversations.open({
                token: token,
                return_im: false,
                users: ids[i]+','+ids[(ids.length/2) + i]
            })
            conversationInfos.push(responsePromise);
        }
        // Going through the paired channels and post messages to them.
        // also store the pairing info on the firebase
        return conversationInfos.map( conversationInfo => {
            return conversationInfo.then( response => handlePairingResponse(response, app, token, workspaceInfo, pairingChannelIdVal));
        });    
    }
    catch(error){
        console.log(error);
        return error.data;
    }
}

// Handles pairing response by posting a message to the pairing channel and storing pairing information on firestore
async function handlePairingResponse(response, app, token, workspaceInfo, pairingChannelIdVal){
    if(!response.ok){
        return console.error(response.error);
    }
    app.client.chat.postMessage({
        token: token,
        channel: response.channel.id,
        text: "You ppl just got paired!"
    });

    let users = await app.client.conversations.members({
        token: token,
        channel: response.channel.id
    });

    let pairedUsers = [];
    /* eslint-disable no-await-in-loop */
    for (var i = 0; i < users.members.length; i++) {
        let profile = await app.client.users.profile.get({
            token: token,
            user: users.members[i]
        });
        if (!profile.profile.bot_id) {
            // console.log('bot id: ', profile.bot_id);
            pairedUsers.push(users.members[i]);
        }
    }
    /* eslint-enable no-await-in-loop */

    return firestoreFuncs.storeNewPairing(workspaceInfo.team.id, response.channel.id, pairedUsers);
}


app.command('/pairup', ({ command, ack, say, context }) => {
    // Acknowledge command request
    ack();
    say(`Trying to pair up.`);
    exports.pairUp(context);

});