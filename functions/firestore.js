const functions = require('firebase-functions');
const admin = require('firebase-admin');

// console.log(typeof(process.env.FUNCTIONS_EMULATOR));
if(process.env.FUNCTIONS_EMULATOR !== "true"){
    
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
    db.collection('api_keys').doc(team_id).set({
        userToken: api_key.token,
        botToken: api_key.botToken,
        botId: api_key.botId,
        botUserId: api_key.botUserId
    })
};
exports.getAPIPair = (team_id) => { 

    //default workspace
    if (team_id === "T013YTT91B6"){ 
        return ({ 
            botToken: "xoxb-1134945307380-1141390769793-fiMOhaTu74UVw4Dc2fAVQHVJ",
            //userToken: "xoxb-1134945307380-1141390769793-fiMOhaTu74UVw4Dc2fAVQHVJ",
            botId: "B013C0RV06T",
            botUserId: "U0145BGNMPB"
        });

    } else{
        db.collection('api_keys').doc(team_id).then((doc) => {	
        if (!(doc && doc.exists)) {	
            return null;	
        }	 
        return doc.data();
        }).catch(() => {	
            return null;
        });
    }


}

/* 
    Stores the new pairings (DM thread ids?) in the corresponding place (with the corresponding
    workspace and channel) in cloud firestore.

    Inputs:
        workspace - workspace id where the new pairings were made
        channel - channel name/id that the pairings were made based off of
        pairing - a singular DM thread id of a new pairing
*/
exports.storeNewPairings = function storeNewPairings(workspace, channel, pairing) {
    let teammatePairingsRef = db.collection('workspaces').doc(workspace)
                                .collection('activeChannels').doc(channel)
                                .collection('teammatePairings').doc(pairing).set({test: 'this is another test hi daniel'});
}

exports.firestoreTest = function firestoreTest() {
    let docRef = db.collection('Workspaces').doc('T0132EDC3M4').get().then((doc) => {	
        if (!(doc && doc.exists)) {	
            return console.log({ error: 'Unable to find the document' });	
        }	
        console.log(String(doc.data().users));	
        return null;
    }).catch((err) => {	
        return console.log('Error getting documents', err);	
    });
}

exports.printPairingData = function testEmulator1() {
    db.collection('workspaces').doc('workspace3').collection('activeChannels').doc('testchannel')
                            .collection('teammatePairings').doc('235363').get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document! :(');
            } else {
                console.log('Document data:', doc.data());
            }
            return null;
        })
        .catch(err => {
        console.log('Error getting document', err);
        });
}

exports.writeMsgToDB = function writeMsgToDB(teamId, userID, channelID,msgToSend,isWarmup) {
	db.collection("workspaces").doc(teamId+"/activeChannels/"+channelID+"/teammatePairings/"+userID).set({
		warmupMessage: msgToSend
	});
}

exports.storeNewPairingChannel = function storeNewPairingChannel(workspaceID, newChannel) {
    db.collection("workspaces").doc(workspaceID).collection('activeChannels').doc(newChannel).set({});
}