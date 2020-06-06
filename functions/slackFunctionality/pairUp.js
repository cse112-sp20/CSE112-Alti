
const shuffle = require('shuffle-array');
const firestoreFuncs = require('../util/firestore');
const index = require('./index');
const app = index.getBolt();
const util = require('../util/util');

// Triggers the pairing up of all people in a given channel. Cleans all the previous pairing information
// under the active pairing channel before starting to pair. If the number of people in the active channel
// is an odd number, pairs the last group of 3 people in a circle.  (user0 -> user1 -> user2 -> user0)
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
        const workspaceInfo = await app.client.team.info({
            token: token
        });
        const allUsers = app.client.users.list({
            token: token
        });

        const channelId = firestoreFuncs.getPairingChannel(workspaceInfo.team.id);
        let pairingChannelIdVal = await channelId;
        // const workspaceInfo = await workspaceInfoPromise.then(result => result.data);

        const members = channelId.then( id => {
            if(id === undefined){
                return Promise.reject(new Error("Could not pair channel " + workspaceInfo.team.id + 
                                                ". Pairing channel could not be retrieved."));
            }
            return app.client.conversations.members({
                    token:token,
                    channel:id
            });
        }).catch(err => Promise.reject(new Error(err+ ' (Workspace: '+workspaceInfo.team.id+' activeChannel: '+pairingChannelIdVal+')')));
        // Clean the previous pairings in case someone has left the channel after last pairup
        const deletePairingResponse = channelId.then( id => {
            return firestoreFuncs.deletePairings(workspaceInfo.team.id, id);
        });
        
        const usersInfo = await Promise.all([allUsers, members, deletePairingResponse]).then(data => {
            const allUsers = data[0];
            const members = data[1];
            if(!allUsers.ok){
                return Promise.reject(new Error("Could not get all users for workspace " + workspaceInfo.team.id + 
                                                ". (app.client.users.list)"));
            }
            if(!members.ok){
                return Promise.reject(new Error("Could not get pairing channel members for workspace " + workspaceInfo.team.id + 
                                                ". (app.client.users.list)"));
            }
            const membersList = members.members;
            const selectedUsers = allUsers.members.filter( user => membersList.includes(user.id));
            return Promise.resolve(selectedUsers);
        });

        // Get all the necessary user ids
        const ids = await Promise.all(usersInfo).then( users => {
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

        // There was less than 2 peaople in the workspace
        if(ids === undefined){
            return console.error("Stopped pairing up. This is probably because there were not enough people in the workspace");
        }
        //Pairing people up randomly and saving the response containing the paired channel information
        conversationInfos = []

        // If the number of people in the channel is even, pair them normally.
        // If not, pair a random group of 3 people in the same chat.
        for (i = 0; i < Math.floor(ids.length/2); i++) {
            const j = Math.floor((ids.length/2) + i);
            var users;
            if( (ids.length % 2 !== 0) && (j === ids.length - 2) ){
                users = ids[i]+','+ids[j]+','+ids[j+1];
            }else{
                users = ids[i]+','+ids[j];
            }
            var responsePromise = app.client.conversations.open({
                token: token,
                return_im: false,
                users: users
            })
            conversationInfos.push(responsePromise);
        }
        // Going through the paired channels and post messages to them.
        // also store the pairing info on the firebase
        conversationInfos = conversationInfos.map( conversationInfo => {
            return conversationInfo
                .then( response => {
                    return handlePairingResponse(response, app, token, workspaceInfo, pairingChannelIdVal);
                })
                .catch(err => {
                    return console.error(err.message+"\n Could not open conversation at workspace " + workspaceInfo.team.id + ".");
            });
        });  
        await Promise.all(conversationInfos);
        return conversationInfos;
    }
    catch(error){
        console.error(error);
        return error.data;
    }
}

// Handles pairing response by posting a message to the pairing channel and storing pairing information on firestore
async function handlePairingResponse(response, app, token, workspaceInfo, pairingChannelIdVal){
    if(!response.ok){
        return (response.error);
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

    // If the number of people in the channel is even, pair them normally.
    // If not, pair a random group of 3 people in a circle where user0 -> user1 -> user2 -> user0.
    if(pairedUsers.length % 2 === 0){
        return await firestoreFuncs.storeNewPairing(workspaceInfo.team.id, response.channel.id, pairedUsers);
    }
    else{
        if(pairedUsers.length !== 3){
            console.error("handlePairingResponse has been passed in an odd number of users that is not 3.");
        }
        // Shuffle so that when the same 3 people get matched, the direction of the matchings alternate
        shuffle(pairedUsers);
        directedPairings = []
        directedPairings.push(firestoreFuncs.storeDirectedPairing(workspaceInfo.team.id, response.channel.id, [pairedUsers[0],pairedUsers[1]]));
        directedPairings.push(firestoreFuncs.storeDirectedPairing(workspaceInfo.team.id, response.channel.id, [pairedUsers[1],pairedUsers[2]]));
        directedPairings.push(firestoreFuncs.storeDirectedPairing(workspaceInfo.team.id, response.channel.id, [pairedUsers[2],pairedUsers[0]]));
        return await Promise.all(directedPairings);
    }
}


app.command('/pairup', ({ command, ack, say, context }) => {
    // Acknowledge command request
    ack();
    say(`Trying to pair up.`);
    exports.pairUp(context);

});