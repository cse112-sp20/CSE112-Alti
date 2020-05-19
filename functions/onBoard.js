/* This file handles the /setup command as well as designation of the active pairing channel
*/

const appHome = require('./appHome');
const firestoreFuncs = require('./firestore');
const index = require('./index');
const {app, token} = index.getBolt();

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Listen for slash command /setup which creates new channel alti-pairing, 
// invites all users in workspace, and designate as active pairing channel
app.command('/setup', async ({payload, body, ack, say }) => {
    ack();
    say("Trying to set up");
    createOnBoardingChannel(app, token, payload.team_id, "alti-pairing");
    //appHome.updateAppHome(body.user.id, body.team.id);
});


// Listen to channel dropdown select menu for new pairing channel
app.action('pairing_channel_selected', async({body, ack, say}) => {
    ack();
    // block action payload type
    var team_info = await app.client.team.info({
        token: token
    }).catch((error) => {
        console.log(error);
    });
    var team_id = body.team.id;
    boardExistingChannel(app, token, team_id, body.actions[0].selected_channel);
    //appHome.updateAppHome(body.user.id, body.team.id);
});


// Create a channel with all the users in the workspace and set as active pairing channel
exports.onBoard = createOnBoardingChannel;
async function createOnBoardingChannel(app, token, team_id, channelName) {
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

        // console.log("Channels: " + channels);

        if (!channels.includes(channelName)) {
            //console.log("No channel called " + channelName);

            var usersDict = await findUsersWorkSpace(app, token);

            var userString = '';
            Object.keys(usersDict).forEach((u) => {
                userString += u + ',';
            });
            userString = userString.substring(0, userString.length - 1);

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
                channel: conversationObj.channel.id,
                text: `Hi everyone! This is where we'll pair you up to participate in quick 
                        and fun warm up and cool down activities :)
                        (To opt out, just leave the channel.)`
            });
            
            firestoreFuncs.storeNewPairingChannel(team_id, conversationObj.channel.id);

            for (userId in usersDict) {
                for (day of days) {
                    firestoreFuncs.setWarmupTime(team_id, userId, "9:00 AM", day);
                    firestoreFuncs.setCooldownTime(team_id, userId, "5:00 PM", day);
                }
            }

        }
        else {
            console.log("Channel " + channelName + " already exists");
        }

    }
    catch (error) {
        console.log(error);
    }
}

// Set an existing channel as the active pairing channel
exports.onBoardExisting = boardExistingChannel;
async function boardExistingChannel(app, token, team_id, channelId) {
    try {
        var userList = await findUsersChannel(app, token, channelId);

        // send welcome message
        app.client.chat.postMessage({
            token: token,
            channel: channelId,
            text: `Hey I've just been added to this channel! Everyone here will participate in quick 
                    and fun warm up and cool down activities :)
                    (To opt out, just leave the channel.)`
            
        });
        firestoreFuncs.storeNewPairingChannel(team_id, channelId);
        for (userId of userList) {
            for (day of days) {
                firestoreFuncs.setWarmupTime(team_id, userId, "9:00 AM", day);
                firestoreFuncs.setCooldownTime(team_id, userId, "5:00 PM", day);
            }
        }
    }
    catch (error) {
        console.log(error);
    }

}

// Find the users within a workspace and return it as a dict of userId: userName
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

// Find the users within a channel and return it as a dict of userId: userName
async function findUsersChannel(app, token, channelId) {
    var users = await app.client.conversations.members({
        token: token,
        channel: channelId
    }).then((obj) => {
        console.log(obj);
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });

    return users;

}


