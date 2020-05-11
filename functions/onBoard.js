
exports.onBoard = async function createOnBoardingChannel(app, token) {
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

        

        if (!channels.includes("alti-pairing")) {
            console.log("No channel called alti-pairing");

            var usersDict = await findUsers(app, token);
    
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
                name: "alti-pairing"
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
        }
        else {
            console.log("Channel alti-pairing already exists");
        }

    }
    catch (error) {
        console.log("Caught error");
        console.log(error);
    }
}

async function findUsers(app, token) {
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
