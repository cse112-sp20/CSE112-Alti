/* TODO 
Send calls to database updating what the current pairing channel is */


exports.onBoard = async function createOnBoardingChannel(app, token, channelName) {
    try {

        var channels = await app.client.conversations.list({
            token: token
        }).catch((error) => {
            console.log(error);
        }).then((obj) => {
            return obj.channels;
        }).then((channels) => {
            var channelNames = [];
            for (var i = 0; i < Object.keys(channels).length; i++) {
                channelNames.push(channels[i].name);
            }
            return channelNames;
        });

        console.log("Channels: " + channels);

        if (!channels.includes(channelName)) {
            console.log("No channel called " + channelName);

            var usersDict = await findUsersWorkSpace(app, token);
    
            console.log("Users:");
            console.log(usersDict);
            var userString = '';
            Object.keys(usersDict).forEach((u) => {
                userString += u + ',';
            });
            userString = userString.substring(0, userString.length - 1);
            console.log(userString);

            // create channel
            var conversationObj = await app.client.conversations.create({
                token: token,
                name: channelName
                //user_ids: userString
            }).catch((error) => {
                console.log(error);
            });

            // invite people
            app.client.conversations.invite({
                token: token, 
                channel: conversationObj.channel.id,
                users: userString
            }).catch((error) => {
                console.log(error);
            });

            // send welcome message
            app.client.chat.postMessage({
                token: token,
                channel: '#'+channelName,
                text: `Hey I've just been added to this channel! Everyone here will participate in quick 
                        and fun warm up and cool down activities :)
                        (To opt out, just leave the channel.)`
            });
        }
        else {
            console.log("Channel " + channelName + " already exists");
        }

    }
    catch (error) {
        console.log("Caught error");
        console.log(error);
    }
}

exports.onBoardExisting = async function boardExistingChannel(app, token, channelId) {
    try {
        var usersDict = await findUsersChannel(app, token, channelId);
        console.log("Users:");
        console.log(usersDict);
        var userString = '';
        Object.keys(usersDict).forEach((u) => {
            userString += u + ',';
        });
        userString = userString.substring(0, userString.length - 1);
        console.log(userString);

        // send welcome message
        app.client.chat.postMessage({
            token: token,
            channel: channelId,
            text: `Hey I've just been added to this channel! Everyone here will participate in quick 
                    and fun warm up and cool down activities :)
                    (To opt out, just leave the channel.)`
            
        });
    }
    catch (error) {
        console.log(error);
    }

}

async function findUsersWorkSpace(app, token) {
    // find users in server
    var userMembers = await app.client.users.list({
        token: token
    }).then((obj) => {
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });
    var usersDict = {};

    userMembers.forEach((u) => {
        if (u.is_bot === false && u.name !== "slackbot") {
            var id = u.id;
            usersDict[id] = u.name;
        }
    });
    return usersDict;
}


async function findUsersChannel(app, token, channelId) {
    var users = await app.client.conversations.members({
        token: token,
        channel: channelId
    }).then((obj) => {
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });

    var usersDict = {};

    users.forEach((u) => {
        if (u.is_bot === false && u.name !== "slackbot") {
            var id = u.id;
            usersDict[id] = u.name;
        }
    });
    return usersDict;

}