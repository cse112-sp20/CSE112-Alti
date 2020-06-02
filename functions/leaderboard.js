const index = require('./index');
const app = index.getBolt();
const firestoreFuncs = require('./firestore');
const functions = require('firebase-functions');

/*
    scheduleResetWeeklyPoints

    Resets all users' weeklyPoints to 0 
    every Sunday at 11:59 PM Pacific Time.
*/
exports.scheduleResetWeeklyPoints = functions.pubsub
                                .schedule('every sunday 23:59')
	                            .timeZone('America/Los_Angeles')
	                            .onRun(async (context) =>  {
    
    // get bot token
    token = context.botToken;

    // get workspace info
    const workspaceInfo = await app.client.team.info({
        token: token
    });

    // get workspace id
    const workspaceID = workspaceInfo.team.id;

    // get list of user IDs in workspace
    var userList = await getUsersInWorkSpace(app, token);

    // reset everyone's weekly points
    for (var userID of userList) {
        firestoreFuncs.resetWeeklyPoints(workspaceID, userID);
    }

	return null;
});

/*
    scheduleResetMonthlyPoints

    Resets all users' monthlyPoints to 0 
    at the end of every month at 11:59 PM Pacific Time.
*/
exports.scheduleResetMonthlyPoints = functions.pubsub
                                .schedule('every sunday 23:59') // CHANGE THIS
	                            .timeZone('America/Los_Angeles')
	                            .onRun(async (context) =>  {
    
    // get bot token
    token = context.botToken;

    // get workspace info
    const workspaceInfo = await app.client.team.info({
        token: token
    });

    // get workspace id
    const workspaceID = workspaceInfo.team.id;

    // get list of user IDs in workspace
    var userList = await getUsersInWorkSpace(app, token);

    // reset everyone's monthly points
    for (var userID of userList) {
        firestoreFuncs.resetMonthlyPoints(workspaceID, userID);
    }

	return null;
});

/*
    getUsersInWorkSpace(app, token)

    Returns a list of all user IDs (no bots) in a workspace.
    Used in scheduleResetWeeklyPoints() and scheduleResetMonthlyPoints().
        PARAMS:
        app         - index.getBolt()
        token       - bot token
*/
// Returns all user IDs in a workspace
async function getUsersInWorkSpace(app, token) {
    var userMembers = await app.client.users.list({
        token: token
    }).then((obj) => {
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });

    // get list of user IDs (ignoring bots)
    var userList = [];
    userMembers.forEach((user) => {
        if (user.is_bot === false) {
            userList.push(user.id);
        }
    });

    return userList;
}

/*
    getLeaderboards(app, token, workspaceID)

    Returns an array containing the weekly and monthly leaderboards as strings.
        PARAMS:
        app         - index.getBolt()
        token       - bot token
        workspaceID - current workspace ID
*/
exports.getLeaderboards = async (app, token, workspaceID) => {
    // get array of IDs and their weekly and monthly points
    const rankingsArr = await firestoreFuncs.getRankings(workspaceID);

    // get user real names (not IDs)
    for (i = 0; i < rankingsArr.length; i++) {
        var m = await app.client.users.info({
            token: token,
            user: rankingsArr[i]['id']
        });
        if (rankingsArr[i]['id'] !== undefined) {
            rankingsArr[i]['id'] = m.user.real_name;
        }
    }

    // get leaderboard strings
    const weeklyLeaderboard = getWeeklyLeaderboardStr(rankingsArr);
    const monthlyLeaderboard = getMonthlyLeaderboardStr(rankingsArr);

    // return them in an array
    return [weeklyLeaderboard, monthlyLeaderboard];
}

/*
    getWeeklyLeaderboardStr(rankingsArr)

    Returns the weekly leaderboard as a string.
        PARAM:
        rankingsArr - array that contains everyone in the workspace,
                along with their user ID, weekly, and monthly points.
*/
function getWeeklyLeaderboardStr(rankingsArr) {
    var rank, name, weeklyPoints;
    var rankings = rankingsArr.sort(compareWeekly);
    // if everyone has 0 points, just return this message
    if (rankings[0]['weeklyPoints'] === 0) {
        return "*Weekly Leaderboard*\n```No one is on the leaderboard!```";
    }
    var weeklyLeaderboard = "*Weekly Leaderboard*\n" + 
                            "```Rank     Name                      Points\n";

    for (var i = 0; i < rankings.length; i++) {
        // do not show people who have 0 points
        if (rankings[i]['weeklyPoints'] === 0) {
            break;
        }
        num = i + 1;
        if (num === 1) {
            rank = "🥇";
        } else if (num === 2) {
            rank = "🥈";
        } else if (num === 3) {
            rank = "🥉";
        } else {
            rank = num + ".";
        }
        name = rankings[i]['id'];
        weeklyPoints = String(rankings[i]['weeklyPoints']);
        weeklyLeaderboard += rank + "       " + rightJustify(name, 25) + 
                                " " + leftJustify(weeklyPoints, 4) + "\n";
    }
    weeklyLeaderboard += "```";

    console.log("weeklyLeaderboard: " + weeklyLeaderboard);
    return weeklyLeaderboard;
}

/*
    compareMonthly(a, b)

    Compares two objects by their weeklyPoints.
    Used in getWeeklyLeaderboardStr().
        PARAMS:
        a - an object to be compared
        b - another object to be compared
*/
function compareWeekly(a, b) {
    if (a.weeklyPoints <= b.weeklyPoints) {
        comparison = 1;
    } else {
        comparison = -1;
    }
    return comparison;
}

/*
    getMonthlyLeaderboardStr(rankingsArr)

    Returns the monthly leaderboard as a string.
        PARAM:
        rankingsArr - array that contains everyone in the workspace,
                along with their user ID, weekly, and monthly points.
*/
function getMonthlyLeaderboardStr(rankingsArr) {
    var rank, name, monthlyPoints;
    var rankings = rankingsArr.sort(compareMonthly);
    var currMonthStr = getMonthStr();
    // if everyone has 0 points, just return this message
    if (rankings[0]['monthlyPoints'] === 0) {
        return "*" + currMonthStr + " Leaderboard*\n```No one is on the leaderboard!```";
    }
    var monthlyLeaderboard = "*" + currMonthStr + " Leaderboard*\n" +
                             "```Rank     Name                      Points\n";

    for (var i = 0; i < rankings.length; i++) {
        // do not show people who have 0 points
        if (rankings[i]['monthlyPoints'] === 0) {
            break;
        }
        num = i + 1;
        if (num === 1) {
            rank = "🥇";
        } else if (num === 2) {
            rank = "🥈";
        } else if (num === 3) {
            rank = "🥉";
        } else {
            rank = num + ".";
        }
        name = rankings[i]['id'];
        monthlyPoints = String(rankings[i]['monthlyPoints']);
        monthlyLeaderboard += rank + "       " + rightJustify(name, 25) + 
                                " " + leftJustify(monthlyPoints, 4) + "\n";
    }
    monthlyLeaderboard += "```";
    console.log("monthlyLeaderboard: " + monthlyLeaderboard);
    return monthlyLeaderboard;
}

/*
    compareMonthly(a, b)

    Compares two objects by their monthlyPoints.
    Used in getMonthlyLeaderboardStr().
        PARAMS:
        a - an object to be compared
        b - another object to be compared
*/
function compareMonthly(a, b) {
    if (a.monthlyPoints <= b.monthlyPoints) {
        comparison = 1;
    } else {
        comparison = -1;
    }
    return comparison;
}

/*
    getMonthStr()

    Returns the current month as a string.
    Used in getMonthlyLeaderboardStr().
*/
function getMonthStr() {
    var month = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"];
    var date = new Date();
    var monthStr = month[date.getMonth()];
    return monthStr;
}

/*
    rightJustify(str, length)

    Given any string and a length, pads the string with space 
    characters to the right to make it have the desired length.
        PARAMS:
        str    - string to be padded
        length - the desired length
*/
function rightJustify(str, len) {
    var fill = [];
    while (fill.length + str.length < len) {
      fill[fill.length] = " ";
    }
    return str + fill.join('');
}

/*
    leftJustify(str, length)

    Given any string and a length, pads the string with space 
    characters to the left to make it have the desired length.
        PARAMS:
        str    - string to be padded
        length - the desired length
*/
function leftJustify(str, len) {
    var fill = [];
    while (fill.length + str.length < len) {
      fill[fill.length] = " ";
    }
    return fill.join('') + str;
}