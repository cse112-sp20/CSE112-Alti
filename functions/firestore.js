const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');

// console.log(typeof(process.env.FUNCTIONS_EMULATOR));
if(process.env.FUNCTIONS_EMULATOR === "true"){
    
    var serviceAccount = require('./serviceAccountKey.json');
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://altitest-5f53d.firebaseio.com"
    });
}
else{
    admin.initializeApp(functions.config().firebase);
}

let db = admin.firestore();


exports.storeAPIPair = (team_id, api_key) => { 

    let setValue = {
        botToken: api_key.botToken,
        botId: api_key.botId,
        botUserId: api_key.botUserId
    }; 
    console.log("SETVALUE : @@@@@@@: " + JSON.stringify(setValue)); 
    db.collection('api_keys').doc(team_id).set(setValue);
};


exports.getAPIPair = (team_id) => { 

    //default workspace (uncomment for testing)

    /*
    //team id here
    if (team_id === "T013YTT91B6"){ 

        //hardcode bot token here
        let botToken = "xoxb-1134945307380-1141390769793-fiMOhaTu74UVw4Dc2fAVQHVJ";

            let botInfo = request.get({
                uri: 'https://slack.com/api/auth.test?token='+botToken,
                method: 'GET'
            }, (e, res, bd) => {
                if (!e && res.statusCode === 200) {
                    return JSON.parse(bd);
                } else {
                    return null;
                }
            });
        

        return ({ 

            botToken: botToken,
            botId: botInfo.bot_id,
            botUserId: botInfo.user_id

        });
       

    } else 
    {
         */



          
            
          
    
    return db.collection('api_keys').doc(team_id).get().then((doc) => {
        if (!(doc && doc.exists)) {	
            console.log("doc does not exist");
            return null;	
        }
        console.log("JSON - data: " + JSON.stringify(doc.data()));
        return doc.data();
    }).catch(() => {	
        return null;
    });
    //}


}

/* 
    Stores the new pairings (DM thread ids?) in the corresponding place (with the corresponding
    workspace and channel) in cloud firestore.
    ASSUMPTION: pairedUsers length is always 2
    Inputs:
        workspace - workspace id where the new pairings were made
        channel - channel name/id that the pairings were made based off of
        dmThreadID - a singular DM thread id of a new pairing
        pairedUsers - the user IDs of the newly paired teammates
*/
exports.storeNewPairing = function storeNewPairings(workspace, channel, dmThreadID, pairedUsers) {
    let usersRef = db.collection('workspaces').doc(workspace)
                           .collection('activeChannels').doc(channel)
                           .collection('pairedUsers');
    
    console.log("HERE@");
    usersRef.doc(pairedUsers[0]).set({
        dmThreadID: dmThreadID,
        partnerID: pairedUsers[1],
    }, {merge: true});

    usersRef.doc(pairedUsers[1]).set({
        dmThreadID: dmThreadID,
        partnerID: pairedUsers[0],
    }, {merge: true})
}

exports.writeMsgToDB = function writeMsgToDB(teamId, userID, channelID,msgToSend,isWarmup) {
	db.collection("workspaces").doc(teamId+"/activeChannels/"+channelID+"/teammatePairings/"+userID).set({
		warmupMessage: msgToSend
	});
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
exports.storeNewPairingChannel = function storeNewPairingChannel(workspaceID, newChannel) {
    deleteCollection('workspaces/'+ workspaceID + '/activeChannels', 100);
    db.collection("workspaces").doc(workspaceID).collection('activeChannels').doc(newChannel).set({}, {merge: true});
}

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
        console.log("SNAPSHOT: ", snapshot);
        if (snapshot.size === 0) {
            return 0;
        }
  
        // Delete documents in a batch
        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          console.log(doc.ref);
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
          deleteQueryBatch(db, query, resolve, reject);
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
    const snapshot = await db.collection('workspaces').doc(workspaceID).collection('activeChannels').get();
    let allChannels = await snapshot.docs.map(doc => doc.id);

    return allChannels[0];
}

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

    if (isWarmup) {
        partnerRef.set({'warmupTask': exercisePrompt}, {merge: true});
    }
    else {
        partnerRef.set({'cooldownTask': exercisePrompt}, {merge: true});
    }
}

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
}

/*
    Description:
        Given a workspace and pairing channel id, return a list of lists that contain paired user IDs
    
    Input: 
        workspaceID - workspace id
        channelID - channel id of pairing channel you're looking to get paired users from
    
    Return:
        If u1 is paired with u2, and u3 paired with u4:
        [[u1, u2], [u3, u4]]
*/
exports.getPairedUsers = async function getPairedUsers(workspaceID, channelID) {
    let userRef = db.collection("workspaces").doc(workspaceID).collection("activeChannels")
                    .doc(channelID).collection('pairedUsers');
    
    return userRef.get().then((querySnapshot) => {
        let partnerIDs = [];
        let pairings = [];
        querySnapshot.forEach((doc) => {
            let partner = doc.data().partnerID;
            if (!partnerIDs.includes(doc.id)) {
                pairings.push([doc.id, partner]);
                partnerIDs.push(partner)
            }
        });
        return pairings;
    });
}

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
}

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
}

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
}

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
}