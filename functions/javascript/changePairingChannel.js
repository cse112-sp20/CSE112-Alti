const index = require('./index');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const appHome = require('./appHome');
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
    const allWorkspaces = await firestoreFuncs.getAllWorkspaces();

    var newChannel;
    // go through all workspaces
    await Promise.all(allWorkspaces.map(async (workspace) => {
        console.log("sched. workspace = "+workspace);
        // get new channel ID from Firestore
        newChannel = await firestoreFuncs.getNewPairingChannelID(workspace);
        // if newChannel is NOT undefined (or 0), then change the pairing channel
        if (newChannel !== undefined && newChannel !== "0") {
            console.log("sched. newChannel = " + newChannel);
            changePairingChannel(context, workspace, newChannel);
            console.log("successfully changed pairing channel for workspace " + workspace);
            // set back to 0
            firestoreFuncs.setNewPairingChannelID(workspace, "0");
        }
    }));
});

/*
    changePairingChannel(context, workspaceID, newChannel)

    Sets the new pairing channel in a given workspace.

    Inputs:
        context - current context
        workspaceID - the workspace ID of where we want to change the pairing channel
        newChannel - the new channel ID to be switched to
*/
async function changePairingChannel(context, workspaceID, newChannel) {
    await onBoard.onBoardExisting(app, context.botToken, workspaceID, newChannel);
}
