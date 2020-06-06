const index = require('./index');
const app = index.getBolt();
const firestoreFuncs = require('../util/firestore');
const functions = require('firebase-functions');

/*
    scheduleResetWeeklyPoints

    Resets all users' weeklyPoints in all workspaces to 0 
    every Monday at 12 AM Pacific Time.
*/
exports.scheduleResetWeeklyPoints = functions.pubsub
                                .schedule('every monday 00:00')
	                            .timeZone('America/Los_Angeles')
	                            .onRun(async (context) =>  {
    // get all workspaces
    const workspaces = await firestoreFuncs.getAllWorkspaces();

    let promise = Promise.resolve();

    // go through each workspace and reset everyone's weekly points
	for (i = 0; i < workspaces.length; i++) {
        let workspace = workspaces[i];
        promise = promise.then(res => {
            return firestoreFuncs.getAPIPair(workspace);
        }, rej => {
            return firestoreFuncs.getAPIPair(workspace);
        });
        promise = promise.then(res => {
            return resetWeeklyHelper(workspace, res)
    });
}

/*
    resetWeeklyHelper(workspaceID, apiPair)

    Resets all users' weeklyPoints to 0 in a workspace.
        PARAMS:
        workspaceID - the workspace ID
        apiPair - API pair for the workspace
*/
async function resetWeeklyHelper(workspaceID, apiPair) {
    if (apiPair !== null) {
        const token = apiPair.botToken;
        try {
            // get list of user IDs in workspace
            var userList = await getUsersInWorkSpace(app, token);

            // reset everyone's weekly points
            for (var userID of userList) {
                firestoreFuncs.resetWeeklyPoints(workspaceID, userID);
            }
            return Promise.resolve();
        } catch (error) {
            console.error(error);
        }
    }
    else {
        console.error("weeklyPoints in workspace " + workspaceID + 
                        " were not reset because the api pair is not stored in firestore");
    }
    return Promise.reject(new Error("Workspace " + workspaceID + 
                                    " weeklyPoints could not be reset"));
  }
  promise.catch(err => console.error(err));
  await promise;
});

/*
    scheduleResetMonthlyPoints

    Resets all users' monthlyPoints in all workspaces to 0
    at the beginning of every month at 12 AM Pacific Time.
*/
exports.scheduleResetMonthlyPoints = functions.pubsub
                                .schedule('1 of month 00:00')
	                            .timeZone('America/Los_Angeles')
	                            .onRun(async (context) =>  {
    
    // get all workspaces
    const workspaces = await firestoreFuncs.getAllWorkspaces();

    let promise = Promise.resolve();

    // go through each workspace and reset everyone's monthly points
	for (i = 0; i < workspaces.length; i++) {
        let workspace = workspaces[i];
        promise = promise.then(res => {
            return firestoreFuncs.getAPIPair(workspace);
        }, rej => {
            return firestoreFuncs.getAPIPair(workspace);
        });
        promise = promise.then(res => {
            return resetMonthlyHelper(workspace, res)
    });
}

/*
    resetMonthlyHelper(workspaceID, apiPair)

    Resets all users' monthlyPoints to 0 in a workspace.
        PARAMS:
        workspaceID - the workspace ID
        apiPair - API pair for the workspace
*/
async function resetMonthlyHelper(workspaceID, apiPair) {
    if (apiPair !== null) {
        const token = apiPair.botToken;
        try {
            // get list of user IDs in workspace
            var userList = await getUsersInWorkSpace(app, token);

            // reset everyone's monthly points
            for (var userID of userList) {
                firestoreFuncs.resetMonthlyPoints(workspaceID, userID);
            }
            return Promise.resolve();
        } catch (error) {
            console.error(error);
        }
    }
    else {
        console.error("monthlyPoints in workspace " + workspaceID + 
                        " were not reset because the api pair is not stored in firestore");
    }
    return Promise.reject(new Error("Workspace " + workspaceID + 
                                    " monthlyPoints could not be reset"));
  }
  promise.catch(err => console.error(err));
  await promise;
});

/*
    getUsersInWorkSpace(app, token)

    Returns a list of all user IDs (including bots) in a workspace.
    Used in scheduleResetWeeklyPoints() and scheduleResetMonthlyPoints().
        PARAMS:
        app         - index.getBolt()
        token       - bot token
*/
async function getUsersInWorkSpace(app, token) {
    var userMembers = await app.client.users.list({
        token: token
    }).then((obj) => {
        return obj.members;
    }).catch((error) => {
        console.log(error);
    });

    // get list of user IDs
    var userList = [];
    userMembers.forEach((user) => {
        userList.push(user.id);
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
    await Promise.all(rankingsArr.map(async (ranking) => {
        const m = await app.client.users.info({
            token: token,
            user: ranking['id']
        });
        if (ranking['id'] !== undefined) {
            ranking['id'] = m.user.real_name;
        }
    }));

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
    // if first person in rankings has 0 points, everyone has 0 points
    if (rankings[0] === undefined || rankings[0]['weeklyPoints'] === 0 || rankings[0]['weeklyPoints'] === undefined) {
        return "*Weekly Leaderboard*\n```No one is on the leaderboard!```";
    }
    var weeklyLeaderboard = "*Weekly Leaderboard*\n" + 
                            "```Rank     Name                      Points\n";

    var i = 0;
    for (var ranking of rankings) {
        // do not show people who have 0 points
        if (ranking['weeklyPoints'] === 0) {
            break;
        }
        // do not show people whose points or names are undefined
        if (ranking['weeklyPoints'] === undefined || 
            ranking['id'] === undefined) {
            continue;
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
        name = ranking['id'];
        weeklyPoints = String(ranking['weeklyPoints']);
        weeklyLeaderboard += rank + "       " + rightJustify(name, 25) + 
                            " " + leftJustify(weeklyPoints, 4) + "\n";
        i++;
    }
    weeklyLeaderboard += "```";
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
    // if first person in rankings has 0 points, everyone has 0 points
    if (rankings[0] === undefined || rankings[0]['monthlyPoints'] === 0 || rankings[0]['monthlyPoints'] === undefined) {
        return "*" + currMonthStr + " Leaderboard*\n```No one is on the leaderboard!```";
    }
    var monthlyLeaderboard = "*" + currMonthStr + " Leaderboard*\n" +
                             "```Rank     Name                      Points\n";
 
    var i = 0;
    for (var ranking of rankings) {
        // do not show people who have 0 points
        if (ranking['monthlyPoints'] === 0) {
            break;
        }
        // do not show people whose points or names are undefined
        if (ranking['weeklyPoints'] === undefined || 
            ranking['id'] === undefined) {
            continue;
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
        name = ranking['id'];
        monthlyPoints = String(ranking['monthlyPoints']);
        if (name !== undefined) {
            monthlyLeaderboard += rank + "       " + rightJustify(name, 25) + 
                                    " " + leftJustify(monthlyPoints, 4) + "\n";
        }
        i++;
    }
    monthlyLeaderboard += "```";
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