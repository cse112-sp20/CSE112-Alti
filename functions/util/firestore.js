const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');
const firestoreFuncs = require('./firestore');
// const dotenv = require('dotenv');
// dotenv.config();

// console.log(typeof(process.env.FUNCTIONS_EMULATOR));
if(process.env.FUNCTIONS_EMULATOR === "true"){
    
    var serviceAccount = require('../serviceAccountKey.json');
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://altitest-5f53d.firebaseio.com"
    });
}
else{
    admin.initializeApp(functions.config().firebase);
}

let db = admin.firestore();


/* 
    storeAPIPair(team_id, api_key): 

    Stores the API keys from the database by team_id. 

    @@PARAMS 
    team_id: same thing as workspace id 

    store the API-tokens/id's in the format: 
        { 
            botToken: "xxxxxxxxxxxxx",
            botId: "Bxxxxxxxxx",
            botUserId: "Uxxxxxxxxx"
        })
 */
exports.storeAPIPair = (team_id, api_key) => { 

    let setValue = {
        botToken: api_key.botToken,
        botId: api_key.botId,
        botUserId: api_key.botUserId
    }; 

    console.log("Team ID: " + team_id);
    console.log("API Keys: Copy/Paste this" + JSON.stringify(setValue, null, 1)); 
    db.collection('api_keys').doc(team_id).set(setValue);
};

/* 
    getAPIPair(team_id):

    Gets the API keys from the database by team_id. 

    @@PARAMS 
    team_id: same thing as workspace id 

    return the API-tokens/id's in the format: 
        { 
            botToken: "xxxxxxxxxxxxx",
            botId: "Bxxxxxxxxx",
            botUserId: "Uxxxxxxxxx"
        })
 */
exports.getAPIPair = (team_id) => { 
        return db.collection('api_keys').doc(team_id).get().then((doc) => {
            if (!(doc && doc.exists)) {	

                //verbose debug message
                
                if(process.env.FUNCTIONS_EMULATOR === "true") {
                    console.log(" Your API_Key is not in the firestore db. " + 
                    "\nRemember that data does not save after restart."+
                    "\n You may have to reinstall your app again if you are using the emulator.");

                } else { 
                    console.log("Your API_Key is not in the firestore db. "); 
                }
                return null;	
            }
            
            //returns the fetched value here 
            return doc.data();
        }).catch(() => {	
            //return null if there was an error in fetching the data
            return null;
        });
};


/* 
    Stores the new pairings (DM thread ids + partnerIDs) in the corresponding place (with the corresponding
    workspace and channel) in cloud firestore.
    ASSUMPTION: pairedUsers length is always 2
    Inputs:
        workspace - workspace id where the new pairings were made
        dmThreadID - a singular DM thread id of a new pairing
        pairedUsers - the user IDs of the newly paired teammates: format [u1, u2]
*/
exports.storeNewPairing = async function storeNewPairing(workspace, dmThreadID, pairedUsers) {
    let channelID = await this.getPairingChannel(workspace);
    let usersRef = db.collection('workspaces').doc(workspace)
                           .collection('activeChannels').doc(channelID)
                           .collection('pairedUsers');
    
    usersRef.doc(pairedUsers[0]).set({
        dmThreadID: dmThreadID,
        partnerID: pairedUsers[1],
    }, {merge: true});

    usersRef.doc(pairedUsers[1]).set({
        dmThreadID: dmThreadID,
        partnerID: pairedUsers[0],
    }, {merge: true});
};
/* 
    Stores a new pairing (DM thread ids + partnerIDs) in the corresponding place (with the corresponding
    workspace and channel) in cloud firestore. Unlike storeNewPairing, this function only sets one way 
    pairing. This means pairedUsers[0] is paired with pairedUsers[1] but not the other way around.
    ASSUMPTION: pairedUsers length is always 2
    Inputs:
        workspace - workspace id where the new pairings were made
        dmThreadID - a singular DM thread id of a new pairing
        pairedUsers - the user IDs of the newly paired teammates: format [u1, u2]
*/
exports.storeDirectedPairing = async function storeDirectedPairing(workspace, dmThreadID, pairedUsers) {
    let channelID = await this.getPairingChannel(workspace);
    let usersRef = db.collection('workspaces').doc(workspace)
                           .collection('activeChannels').doc(channelID)
                           .collection('pairedUsers');
    
    usersRef.doc(pairedUsers[0]).set({
        dmThreadID: dmThreadID,
        partnerID: pairedUsers[1],
    }, {merge: true});
};
exports.writeMsgToDB = function writeMsgToDB(teamId, userID, channelID,msgToSend,isWarmup) {
	db.collection("workspaces").doc(teamId+"/activeChannels/"+channelID+"/teammatePairings/"+userID).set({
		warmupMessage: msgToSend
	});
};

// Deletes all pairing information under a specific pairing channel of a workspace
exports.deletePairings = async function deletePairings(workspaceId, channelId){
    const path = 'workspaces/'+ workspaceId + '/activeChannels/' + channelId + '/pairedUsers';
    return await deleteCollection(path, 100);
}
/*
    Description:
        This function will store a newly designated pairing channel under the 'activeChannels' collection.
        In addition, it will delete the currently designated pairing channel and all data associated with it.
        We do this to enforce one pairing channel per workspace (for now).
    Input: 
        workspaceID - workspace id
        channelID - channel id of the new channel designated as the pairing channel
*/
exports.storeNewPairingChannel = async function storeNewPairingChannel(workspaceID, newChannel) {
    let currChannel = await this.getPairingChannel(workspaceID);
    if (currChannel === newChannel) {
        return;
    }

    if (currChannel === undefined) {
        db.collection('workspaces').doc(workspaceID).set({}, {merge: true});
        db.collection("workspaces").doc(workspaceID).collection('activeChannels').doc(newChannel).set({}, {merge: true}); 
    }
    else {
        // To avoid the "ghost document" problem on the workspace
        db.collection('workspaces').doc(workspaceID).set({}, {merge: true});

        await deleteCollection('workspaces/'+ workspaceID + '/activeChannels', 100);
        db.collection("workspaces").doc(workspaceID).collection('activeChannels').doc(newChannel).set({}, {merge: true});
    }
};


/*
    Description:
        Recursively deletes a specified collection from the db.
    
    Input:
        collectionPath - path to get to the collection you want to delete.
        batchSize - the max # of documents you want to delete within that collection, I think?
*/
function deleteCollection(collectionPath, batchSize) {
    let collectionRef = db.collection(collectionPath);
    let query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve, reject);
    });
  }
  
/*
    Description:
        Helper function for deleteCollection
*/
function deleteQueryBatch(query, resolve, reject) {
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size === 0) {
            return 0;
        }
  
        // Delete documents in a batch
        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          //console.log(doc.ref);
        });
  
        // eslint-disable-next-line promise/no-nesting
        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }
  
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(query, resolve, reject);
        });
        // eslint-disable-next-line consistent-return
        return null;
      })
      .catch(reject);
}
 
/*
    Description:
        This function will retrieve the single pairing channel (id) corresponding to a workspace
    
    Input:
        workspaceID: workspace id you're trying to get the pairing channel for.
*/
exports.getPairingChannel = async function getPairingChannel(workspaceID) {
    // Avoid "ghost document" problem on workspace document
    db.collection('workspaces').doc(workspaceID).set({}, {merge: true});
    const snapshot = await db.collection('workspaces').doc(workspaceID).collection('activeChannels').get();
    let allChannels = await snapshot.docs.map(doc => doc.id);
    return allChannels[0];
};

/* 
    Description:
        This function gets called when a user picks an exercise for their pair's warmup or cooldown activity.
        The activity task prompt gets stored in the user's partner's warmup or cooldown task field.
        This function needs to determine the given user's partner as a part of the functionality which can
        be found in the entry for that user in teammatePairings collection. 
    Input: 
        workspaceID - workspace id
        userID - user id of user who selected this task for their partner
        isWarmup - (boolean) true if warmup, false if cooldown
        exercisePrompt - for example: "_____ sent you this C++ coding speed typing test to warmup your
                                       mind and fingers! Complete it here: https://somelink.com"
*/
exports.storeTypeOfExercise = async function storeTypeOfExercise(workspaceID, userID, isWarmup, exercisePrompt) {
    let channelID = await this.getPairingChannel(workspaceID);
    let partnerID = await this.getPartner(workspaceID, channelID, userID);
    let partnerRef = db.collection("workspaces").doc(workspaceID).collection("activeChannels").doc(channelID).collection('pairedUsers').doc(partnerID)
    let setResult;
    if (isWarmup) {
        setResult = await partnerRef.set({'warmupTask': exercisePrompt}, {merge: true});
    }
    else {
        setResult = await partnerRef.set({'cooldownTask': exercisePrompt}, {merge: true});
    }
    //console.log(workspaceID + "   " + userID);
    // update user's points
    firestoreFuncs.updatePoints(workspaceID, userID);
    return setResult;
	
}

/*
    Description:
        Gets the exercise prompt for a particular user, for warmup or cooldown

    Inputs:
        workspaceID - workspace id that you are getting prompt for
        userID - user id for which that prompt is going to be sent to
        isWarmup - is this prompt for a warmup or cooldown (boolean), true for warmup, false for cooldown

    Returns:
        Promise that you have to await -> str that contains the prompt
*/
exports.getExercisePrompt = async function getExercisePrompt(workspaceID, userID, isWarmup) {
    let channelID = await this.getPairingChannel(workspaceID);
    let userRef = db.collection("workspaces").doc(workspaceID).collection("activeChannels")
                    .doc(channelID).collection('pairedUsers').doc(userID);
    
    return userRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return undefined;
            }
            else {
                if (isWarmup) {
                    return doc.data().warmupTask;
                }
                else {
                    return doc.data().cooldownTask;
                }
            }
        })
        .catch(err => {
            console.log('Error getting user document: ', err);
            return undefined;
        });
};

/*
    Description:
        Given a user within a pairing channel, return its partner's userID.
    
    Input:
        workspaceID - workspace id
        channelID - channel id over channel from which pairing was created
        userID - user id of user who you want to find their respective partner
    
    Returns:
        partner's userID, or undefined if error or cannot find the user passed in
*/
exports.getPartner = function getPartner(workspaceID, channelID, userID) {
    // console.log(workspaceID);
    // console.log(channelID);
    // console.log(userID);
    let userRef = db.collection("workspaces").doc(workspaceID).collection("activeChannels")
                    .doc(channelID).collection('pairedUsers').doc(userID);
    
    return userRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return undefined;
            }
            else {
                return doc.data().partnerID;
            }
        })
        .catch(err => {
            console.log('Error getting user document: ', err);
            return undefined;
        });
};

/*
    Description:
        Given a workspace and pairing channel id, return a list of objects, where
        each object contains the paired users, and the DM thread id they are paired within.
    
    Input: 
        workspaceID - workspace id
    
    Return:
        If u1 is paired with u2 (in dm thread 'd1'), and u3 paired with u4 (in dm thread 'd2'),
        this function will return:
            [{users: [u1, u2], dmThreadID: 'd1'}, {users: [u3, u4], dmThreadID: 'd2'}]
        If there is an odd number of people in the workspace and users u1, u2, and u3 are paired
        in a circular way, returns that entry in the format:
            {users: [u1, u2, u3], dmThreadID: 'd1'}
*/  
exports.getPairedUsers = async function getPairedUsers(workspaceID) {
    let channelID = await this.getPairingChannel(workspaceID);
    let userRef = db.collection("workspaces").doc(workspaceID).collection("activeChannels")
                    .doc(channelID).collection('pairedUsers');
    return userRef.get().then((querySnapshot) => {
        let threadHash = {};
        querySnapshot.forEach((doc) => {
            let thread = doc.data().dmThreadID;
            if(threadHash[thread] === undefined){
                threadHash[thread] = [];
            }
            threadHash[thread].push(doc.id);
        });
        let pairings = [];
        for(var thread in threadHash){
            pairings.push({users: threadHash[thread], dmThreadID: thread});
        }
        return pairings;
    });
};
 
/*
    Description:
        Sets the warmup time (when they will receive their warmup task) for
        a particular user in the worskpace.
    
    Inputs:
        workspaceID - workspace id of where time is getting set
        userID - user id for which the time/day is getting set
        time - specific time during a day they will receive the task.
               the time is in the following format in a string: XX:XX AM/PM
               So, for example, "09:00 AM"
        day - the day of the week this time is set for.
              for ex: 'monday', 'tuesday', 'wednesday', etc.
*/
exports.setWarmupTime = function setWarmupTime(workspaceID, userID, time, day) {
    let userDocRef = db.collection('workspaces').doc(workspaceID).collection('users').doc(userID);
    let data = {};
    data[day + 'Start'] = time;
    userDocRef.set(data, {merge: true});
};

/*
    Description:
        Retrieves the warmup time for a particular user in a workspace for a given day.
        Returns a promise that you need to 'await'
    Inputs:
        workspaceID - workspace id of where time is getting retrieved
        userID - user id for which the time/day is getting retrieved
        day - the day of the week this time is getting retrieved for 
              for ex: 'monday', 'tuesday', 'wednesday', etc.
*/
exports.getWarmupTime = function getWarmupTime(workspaceID, userID, day) {
    let userDocRef = db.collection('workspaces').doc(workspaceID).collection('users').doc(userID);

    return userDocRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return undefined;
            }
            else {
                return doc.data()[day + 'Start'];
            }
        })
        .catch(err => {
            console.log('Error getting user document: ', err);
            return undefined;
        });
};

/*
    Description:
        Sets the cooldown time (when they will receive their cooldown task) for
        a particular user in the worskpace.
    
    Inputs:
        workspaceID - workspace id of where time is getting set
        userID - user id for which the time/day is getting set
        time - specific time during a day they will receive the task.
               the time is in the following format in a string: XX:XX AM/PM
               So, for example, "05:00 PM"
        day - the day of the week this time is set for.
              for ex: 'monday', 'tuesday', 'wednesday', etc.
*/
exports.setCooldownTime = function setWarmupTime(workspaceID, userID, time, day) {
    let userDocRef = db.collection('workspaces').doc(workspaceID).collection('users').doc(userID);
    let data = {};
    data[day + 'End'] = time;
    userDocRef.set(data, {merge: true});
};

/*
    Description:
        Retrieves the warmup time for a particular user in a workspace for a given day.
        Returns a promise that you need to 'await'
    Inputs:
        workspaceID - workspace id of where time is getting retrieved
        userID - user id for which the time/day is getting retrieved
        day - the day of the week this time is getting retrieved for 
              for ex: 'monday', 'tuesday', 'wednesday', etc.
*/
exports.getCooldownTime = function getWarmupTime(workspaceID, userID, day) {
    let userDocRef = db.collection('workspaces').doc(workspaceID).collection('users').doc(userID);

    return userDocRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return undefined;
            }
            else {
                return doc.data()[day + 'End'];
            }
        })
        .catch(err => {
            console.log('Error getting user document: ', err);
            return undefined;
        });
};

/*
    Description:
        Gets the current workspace 'owner'
        Returns a promise that you have to 'await'
    
    Input:
        workspaceID - workspace id that you want to get owner of
*/
exports.getOwner = function getOwner(workspaceID) {
    let workspaceDocRef = db.collection('workspaces').doc(workspaceID);

    return workspaceDocRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return undefined;
            }
            else {
                return doc.data().owner;
            }
        })
        .catch(err => {
            console.log('Error getting workspace document: ', err);
            return undefined;
        });
};

/*
    Description:
        Sets the owner associated with a given workspace
    
    Inputs:
        workspaceID - workspace id of the workspace you want to set owner of
        userID - user id of the new owner
*/
exports.setOwner = function updateOwner(workspaceID, userID) {
    let workspaceDocRef = db.collection('workspaces').doc(workspaceID);

    workspaceDocRef.set({
        owner: userID
    }, {merge: true});
};

/*
    Description:
        Retrieves all workspace ids
    Returns: 
        list of workspace ids, for ex: ['T123452324', 'T62345234', 'T6762342342']
*/
exports.getAllWorkspaces = async function getAllWorkspaces() {
    const snapshot = await db.collection('workspaces').get();
    let allWorkspaces = await snapshot.docs.map(doc => doc.id);

    return allWorkspaces;
}

/*
    Description:
        Gets all pairing data associated with a particular user
    
    Inputs:
        workspaceID - the workspace the user you're querying about is in
        userID - the user id of the user you want the pairing data for
    
    Returns:
        Returns a Promise that resolves into an object with the following keys:
        (obj) - {
            dmThreadID,
            partnerID,
            warmupTask,
            cooldownTask
        }
*/
exports.getUserPairingData = async function getUserData(workspaceID, userID) {
    let channelID = await this.getPairingChannel(workspaceID);
    let userDocRef = db.collection('workspaces').doc(workspaceID).collection('activeChannels').doc(channelID).collection('pairedUsers').doc(userID);

    return userDocRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return undefined;
            }
            else {
                return doc.data();
            }
        })
        .catch(err => {
            console.log('Error getting user document: ', err);
            return undefined;
        });
}

/*
    updatePoints(workspaceID, userID)

    Increments a user's weeklyPoints and monthlyPoints by 1.
    Called when a user sends either a warmup or cooldown to their partner.
    PARAMS:
        workspaceID - current workspace ID
        userID      - ID of user whose points will be incremented
*/
exports.updatePoints = async function updatePoints(workspaceID, userID) {
    let userDocRef = db.collection('workspaces')
                    .doc(workspaceID)
                    .collection('users')
                    .doc(userID);
    userDocRef.update({
        weeklyPoints: admin.firestore.FieldValue.increment(1),
        monthlyPoints: admin.firestore.FieldValue.increment(1)
    });
};

/*
    resetWeeklyPoints(workspaceID, userID)

    Resets a user's weeklyPoints to 0.
    Called when a new user joins the pairing channel AND
    at the end of the week.
    PARAMS:
        workspaceID - current workspace ID
        userID      - ID of user whose points will be reset
*/
exports.resetWeeklyPoints = async function resetWeeklyPoints(workspaceID, userID) {
    let data = {
        weeklyPoints: 0
    };
    let setDoc = db.collection('workspaces')
                .doc(workspaceID)
                .collection('users')
                .doc(userID)
                .set(data, {merge: true});
};

/*
    resetMonthlyPoints(workspaceID, userID)

    Resets a user's monthlyPoints to 0.
    Called when a new user joins the pairing channel AND
    at the end of the month.
    PARAMS:
        workspaceID - current workspace ID
        userID      - ID of user whose points will be reset
*/
exports.resetMonthlyPoints = async function resetMonthlyPoints(workspaceID, userID) {
    let data = {
        monthlyPoints: 0
    };
    let setDoc = db.collection('workspaces')
                .doc(workspaceID)
                .collection('users')
                .doc(userID)
                .set(data, {merge: true});
};

/*
    getRankings(workspaceID)

    Returns an array of all users in the pairing channel,
    along with their weekly points and monthly points.
    PARAMS:
        workspaceID - current workspace ID
*/
exports.getRankings = async function getRankings(workspaceID) {
    let rankings = [];
    let users = db.collection('workspaces')
                .doc(workspaceID)
                .collection('users');
    return users.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let ranking = {id:doc.id, weeklyPoints:doc.data().weeklyPoints, monthlyPoints:doc.data().monthlyPoints};
            if (ranking['weeklyPoints'] !== undefined) {
                rankings.push(ranking);
            }
        });
        return rankings;
    });
};

/*
    setNewPairingChannelID(workspaceID, newChannel)
    Given a workspace, stores the ID for the new pairing channel,
    in the newChannel field in Firestore.
    Inputs:
        workspaceID - the workspace of the new pairing channel
        newChannel - the new pairing channel's ID
*/
exports.setNewPairingChannelID = async function setNewPairingChannelID(workspaceID, newChannel) {
    let data = {
        newChannel: newChannel
    };
    let setDoc = db.collection('workspaces')
                .doc(workspaceID)
                .set(data, {merge: true});
};

/*
    getNewPairingChannelID(workspaceID)
    Given a workspace, retrieves the ID for the new pairing channel,
    in the newChannel field in Firestore.
    Inputs:
        workspaceID - the workspace of the new pairing channel
    Returns:
        The ID of the new pairing channel
*/
exports.getNewPairingChannelID = async function getNewPairingChannelID(workspaceID) {
    const snapshot = await db.collection('workspaces').doc(workspaceID).get();
    return snapshot.data().newChannel;
};
