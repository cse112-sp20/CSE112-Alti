const shuffle = require('shuffle-array');
const firestoreFuncs = require('./firestore');

// Triggers the pairing up of all people in a given channel.
exports.pairUp = async function pairUp(app, token, channelName){
    try{
        // TODO: Take this out of this function and pass it in as a parameter ideally
        const workspaceInfo = await app.client.team.info({
            token: token
        })
        
        const channelId = getChannelIdByName(app, token, channelName)
        var pairingChannelIdVal;
        // const workspaceInfo = await workspaceInfoPromise.then(result => result.data);

        const members = channelId.then( id => {
            pairingChannelIdVal = id;
            return app.client.conversations.members({
                    token:token,
                    channel:id
            });
        });
        const usersInfo = await members.then( members => {
            
            const ids = members.members;
            return ids.map(id => {
                return app.client.users.info({
                    token:token,
                    user:id
                });
            })
        });
        // Get all the necessary user ids
        const ids = await Promise.all(usersInfo).then( usersInfo => {
            const users = usersInfo.map( info => info.user);
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
        Promise.all(conversationInfos).then(async responses => {
            return Promise.resolve(responses.map(response => {
                return handlePairingResponse(response, app, token, workspaceInfo, pairingChannelIdVal);
            }));

        })
        .catch(console.error);       


    }
    catch(error){
        console.error(error);
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
    return firestoreFuncs.storeNewPairings(workspaceInfo.team.id, pairingChannelIdVal, response.channel.id);
}


// Given a channel name, returns the channel ID.
async function getChannelIdByName(app, token, channelName){
    const conversations = app.client.conversations.list({
        token:token
    });
    const channelId = conversations.then( conversations => {
        const filteredChannels = conversations.channels.filter( channel => {
            if(channel.name === channelName){
                return true;
            }
            else return false;
        })

        if (filteredChannels.length === 0){
            console.error("Target channel not found");
            return undefined;
        }
        if (filteredChannels.length > 1){
            console.error("Multiple channels found");
            return undefined;
        }

        return filteredChannels[0].id;
    });
    return channelId;
}