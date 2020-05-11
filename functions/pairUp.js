const shuffle = require('shuffle-array');
const firestoreFuncs = require('./firestore');

exports.pairUp = async function pairUp(app, token, channelName){
    try{
        
        const channelId = getChannelIdByName(app, token, channelName)

        const members = channelId.then( id => {
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
            // // Randomize the order of people
            shuffle(ids);
            return ids
        });


        for (i = 0; i < ids.length/2; i++) {

            var responsePromise = app.client.conversations.open({
                token: token,
                return_im: false,
                users: ids[i]+','+ids[(ids.length/2) + i]
            })
            responsePromise.then(async response => {
                handlePairingResponse(response, app, token);
                // TODO need to get workspace somehow
                var workspacePromise = await app.client.team.info({
                    token: token
                })

                firestoreFuncs.storeNewPairings(workspacePromise.team.id, await channelId, response.channel.id);
            })
            .catch(console.error);
        }

    }
    catch(error){
        console.error(error);
    }
}


async function handlePairingResponse(response, app, token){

    if(!response.ok){
        return console.error(response.error);
    }
    // app.client.conversations.join({
    //     token: token,
    //     channel: response.channel.id
    // });
    return app.client.chat.postMessage({
        token: token,
        channel: response.channel.id,
        text: "You ppl just got paired!"
    });
}


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