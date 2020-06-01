const index = require('./index');
const app = index.getBolt();
const firestoreFuncs = require('./firestore');
const functions = require('firebase-functions');
//const myWorkspaceID = "T012WBGBVM5";

exports.scheduledLeaderboard = 
    functions.pubsub
    .schedule('every friday 17:00') // 5 PM // 'every friday 17:00'
	.timeZone('America/Los_Angeles')
	.onRun(async (context, botToken) =>  {
        try {
            console.log("HELLO! It is Friday, and the time is 5 PM.");

            // get bot token
            if (context !== undefined) {
                token = context.botToken;
            }
            else {
                token = botToken;
            }

            // get workspace info
            const workspaceInfo = await app.client.team.info({
                token: token
            });

            // get workspace id
            const workspaceID = workspaceInfo.team.id;
        
        // send message!
        sendLeaderboardMessage(app, token, workspaceID);

    } catch (error) {
        console.log(error);
    }

	return null;
});

async function sendLeaderboardMessage(app, token, workspaceID) {
    try {
        // get pairing channel
        const pairingChannel = await firestoreFuncs.getPairingChannel(workspaceID);

        // get weekly and monthly leaderboards as a block for the message
        const leaderboardBlock = getLeaderboardBlock(workspaceID);

        // send message to pairing channel
        app.client.chat.postMessage({
            token: token,
            channel: pairingChannel,
            text: "Happy Friday!! 🎉\nGreat job this week, everyone!\nHere are the stats from this past week and for this month:",
            blocks: leaderboardBlock
        });

    } catch (error) {
        console.log(error);
    }
}

// given the workspace ID,
// returns the leaderboard block to use in our message
function getLeaderboardBlock(workspaceID) {
    // get sorted array of IDs and their points 
    const rankingsArr = firestoreFuncs.getRankings(workspaceID);

    // get leaderboard strings
    const weeklyLeaderboard = getWeeklyLeaderboardStr(rankingsArr);
    const monthlyLeaderboard = getMonthlyLeaderboardStr(rankingsArr);

    const leaderboardBlock = 
    [
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": 
            {
                "type": "mrkdwn",
                "text": weeklyLeaderboard
            }
        },
        {
            "type": "section",
            "text": 
            {
                "type": "mrkdwn",
                "text": monthlyLeaderboard
            }
        }
    ];
    return leaderboardBlock;
}

// returns weekly leaderboard string
function getWeeklyLeaderboardStr(rankingsArr) {
    var rank, name, weeklyPoints;
    var weeklyLeaderboard = "*Weekly Leaderboard*\n" +
                        "Rank       Name                    Points\n";

    for (var i = 0; i < rankingsArr.length; rank++) {
        rank = i + 1;
        name = rankingsArr[i]['id'];
        weeklyPoints = rankingsArr[i]['weeklyPoints'];
        weeklyLeaderboard += rank + ".      " + name + "                    " + weeklyPoints + "\n";
    }

    console.log(weeklyLeaderboard);
    return weeklyLeaderboard;
}

// returns monthly leaderboard string
function getMonthlyLeaderboardStr(rankingsArr) {
    var rank, name, monthlyPoints;
    var currMonthStr = getMonthStr();
    var monthlyLeaderboard = "*" + currMonthStr + "* Leaderboard\n" +
                        "Rank       Name                    Points\n";

    for (var i = 0; i < rankingsArr.length; rank++) {
        rank = i + 1;
        name = rankingsArr[i]['id'];
        monthlyPoints = rankingsArr[i]['monthlyPoints'];
        monthlyLeaderboard += rank + ".      " + name + "                   " + monthlyPoints + "\n";
    }
    
    console.log(monthlyLeaderboard);
    return monthlyLeaderboard;
}

// returns the current month as a string
// used in getMonthlyLeaderboardStr()
function getMonthStr() {
    var month = ["January", "February", "March", "April", "May", "June", "July", 
                    "August", "September", "October", "November", "December"];
    var date = new Date();
    var monthStr = month[date.getMonth()];
    return monthStr;
}