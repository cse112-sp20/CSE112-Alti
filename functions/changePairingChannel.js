const index = require('./index');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const app = index.getBolt();

/*
    scheduledChangePairingChannel

    If admin selected a new pairing channel during the week,
    switches pairing channels at 12:55 PM Pacific Time 
    (before scheduledPairUp runs).
*/
exports.scheduledChangePairingChannel = functions.pubsub
									    .schedule('every sunday 12:55')
										.timeZone('America/Los_Angeles')
										.onRun(async (context) =>  {

    // get all workspaces
    const allWorkspaces = await firestoreFuncs.getAllWorkspaces();
  
    let promise = Promise.resolve();

    // go through all workspaces
        for(i = 0; i < allWorkspaces.length; i++){
        let workspace = allWorkspaces[i];
        // check if they want to change pairing channels
        if (newChannel !== undefined) {
            promise = promise.then(res => {
                return firestoreFuncs.getAPIPair(workspace);
            },rej => {
                return firestoreFuncs.getAPIPair(workspace);
            });
            promise = promise.then(res => {
                return handleChangePairingChannel(workspace, res)
            });
        }
    }
    promise.catch(err => console.error(err));
    await promise;
});

/*
    handleChangePairingChannel(workspace, res)

    
*/
async function handleChangePairingChannel(workspaceID, apiPair) {
    if (apiPair !== null) {
        const token = apiPair.botToken;
        try {
            // TODO
            // set current pairing channel equal to new pairing channel

            return Promise.resolve();
        } catch (error) {
            console.error(error);
        }
    }
    else {
        console.error("Pairing channel in workspace " + workspaceID + 
                        " not changed because the api pair is not stored in firestore");
    }
    return Promise.reject(new Error("Workspace " + workspaceID + 
                                    " pairing channel could not be changed"));
  }
  promise.catch(err => console.error(err));
  await promise;
});
