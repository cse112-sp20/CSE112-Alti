/* This file handles the /setup command as well as designation of the active pairing channel
*/

const appHome = require('./appHome');
const firestoreFuncs = require('./firestore');
const index = require('./index');
const app = index.getBolt();

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Listen for slash command /setup which creates new channel alti-pairing, 
// invites all users in workspace, and designate as active pairing channel
app.command('/setup', async ({payload, body, ack, say, context}) => {
    ack();
    say("Trying to set up");
    createOnBoardingChannel(app, context.botToken, payload.team_id, "alti-pairing");
    appHome.updateAppHome(body.user_id, body.team_id, context);
});


// Listen to channel dropdown select menu for new pairing channel
app.action('pairing_channel_selected', async({body, ack, say, context}) => {
    ack();
    // block action payload type
    var team_info = await app.client.team.info({
        token: context.botToken
    }).catch((error) => {
        console.log(error);
    });
    var team_id = body.team.id;
    // TODO make the update run after the db is updated in boardExistingChannel call
    await boardExistingChannel(app, context.botToken, team_id, body.actions[0].selected_channel);
    //console.log("After boardExisting -> Before update app home");
    appHome.updateAppHome(body.user.id, body.team.id, context);
});


// Create a channel with all the users in the workspace and set as active pairing channel
async function createOnBoardingChannel(app, token, team_id, channelName) {
    try {
        var promises = [];
        
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
            
            promises.push(firestoreFuncs.storeNewPairingChannel(team_id, conversationObj.channel.id));

            for (var userId in usersDict) {
                for (var day of days) {
                    promises.push(firestoreFuncs.setWarmupTime(team_id, userId, "9:00 AM", day));
                    promises.push(firestoreFuncs.setCooldownTime(team_id, userId, "5:00 PM", day));
                }
            }
            Promise.all(promises).catch((error) => {
                console.log(error);
            });

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
async function boardExistingChannel(app, token, team_id, channelId) {
    try {
        var promises = [];
        var userList = await findUsersChannel(app, token, channelId);

        // send welcome message
        app.client.chat.postMessage({
            token: token,
            channel: channelId,
            text: `Hey I've just been added to this channel! Everyone here will participate in quick 
                    and fun warm up and cool down activities :)
                    `
            
        });
        // TODO (To opt out, just leave the channel.)
        await firestoreFuncs.storeNewPairingChannel(team_id, channelId);
        for (var userId of userList) {
            for (var day of days) {
                promises.push(firestoreFuncs.setWarmupTime(team_id, userId, "9:00 AM", day));
                promises.push(firestoreFuncs.setCooldownTime(team_id, userId, "5:00 PM", day));
            }
        }
        Promise.all(promises).catch((error) => {
            console.log(error);
        });
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
        // console.log(obj);
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });

    return users;

}

/*
app.event('member_joined_channel', async ({ body, context }) => {
    console.log("Member joined channel");
    console.log(body);
    var activeChannel = await firestoreFuncs.getPairingChannel(body.team_id);
    if (activeChannel === body.event.channel) {
        console.log("Member joined pairing channel");
        // TODO 
        // 1. DM user with information about being in pairing channel
        // 2. Store user's info in db
        //firestoreFuncs.setWarmupTime(team_id, userId, "9:00 AM", day);
        //firestoreFuncs.setCooldownTime(team_id, userId, "5:00 PM", day);
    }
});

app.event('member_left_channel', async ({ body, context }) => {
    console.log("Member left channel");
    console.log(body);
    if (activeChannel === body.event.channel) {
        console.log("Member left pairing channel");
    }
});
*/

exports.onBoard = createOnBoardingChannel;
exports.onBoardExisting = boardExistingChannel;
