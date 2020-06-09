const index = require('./index');
const functions = require('firebase-functions');
const firestoreFuncs = require('../util/firestore');
const onBoard = require('./onBoard');
const app = index.getBolt();

/*
    scheduleChangePairingChannel

    If the owner selected a new pairing channel during the week,
    switches pairing channels at 12:55 PM Pacific Time
    (before scheduledPairUp runs).
*/
exports.scheduleChangePairingChannel = functions.pubsub
							        .schedule('every sunday 12:55')
							        .timeZone('America/Los_Angeles')
                                    .onRun(async (context) => {

    // get all workspaces
    const workspaces = await firestoreFuncs.getAllWorkspaces();

    let promise = Promise.resolve();

    // go through each workspace
    for (i = 0; i < workspaces.length; i++) {
        let workspace = workspaces[i];
        promise = promise.then(res => {
            return firestoreFuncs.getAPIPair(workspace);
        }, rej => {
            return firestoreFuncs.getAPIPair(workspace);
        });
        promise = promise.then(res => {
            return changePairingChannelHelper(workspace, res)
    });
}

/*
changePairingChannelHelper(workspaceID, apiPair)

Changes the pairing channel in a given workspace
(if it was requested to be changed mid-week).

Inputs:
    workspaceID - the workspace ID
    apiPair - API pair for the workspace
*/
async function changePairingChannelHelper(workspaceID, apiPair) {
    if (apiPair !== null) {
        const token = apiPair.botToken;
        try {
            // get new channel ID from Firestore
            var newChannel = await firestoreFuncs.getNewPairingChannelID(workspaceID);

            // if newChannel is NOT undefined or 0, then change the pairing channel
            if (newChannel !== undefined && newChannel !== 0) {
                // switch pairing channel
                await onBoard.onBoardExisting(app, token, workspaceID, newChannel);
                console.log("Changed pairing channel to " + newChannel + " in workspace " + workspaceID);
                // set newChannel to 0
                firestoreFuncs.setNewPairingChannelID(workspaceID, 0);
            }
            return Promise.resolve();
        } catch (error) {
            console.error(error);
        }
    }
    else {
        console.error("New pairing channel in workspace " + workspaceID + 
                        " could not be checked/changed because the api pair is not stored in firestore");
    }
    return Promise.reject(new Error("Workspace " + workspaceID + 
                                    " pairing channel could not be checked/changed"));
    }
    promise.catch(err => console.error(err));
    await promise;
});