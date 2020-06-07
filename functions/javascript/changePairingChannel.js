const index = require('./index');
const functions = require('firebase-functions');
const firestoreFuncs = require('./firestore');
const appHome = require('./appHome');
const onBoard = require('./onBoard');
const app = index.getBolt();

/*
    scheduledChangePairingChannel

    If the owner selected a new pairing channel during the week,
    switches pairing channels at 12:55 PM Pacific Time
    (before scheduledPairUp runs).
*/
exports.scheduledChangePairingChannel = functions.pubsub
							            .schedule('every sunday 12:55')
							            .timeZone('America/Los_Angeles')
                                        .onRun(async (context) => {

    // get all workspaces
    const allWorkspaces = await firestoreFuncs.getAllWorkspaces();

    // go through all workspaces
    await Promise.all(allWorkspaces.map(async (workspace) => {
        // get new channel ID from Firestore
        var newChannel = await firestoreFuncs.getNewPairingChannelID(workspace);
        // if newChannel is NOT undefined, then change the pairing channel
        if (newChannel !== undefined) {
            changePairingChannel(context, workspace, newChannel);
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
    await onBoard.boardExistingChannel(app, context.botToken, workspaceID, newChannel);
	appHome.updateAppHome(body.user.id, body.team.id, context); // update app home
}
