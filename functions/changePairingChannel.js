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
                return handleChangePairingChannel(context, workspace)
            });
        }
    }
    promise.catch(err => console.error(err));
    await promise;
});

/*
    handleChangePairingChannel(workspace, res)


*/
async function handleChangePairingChannel(context,team_id) {
	var newChannel = firestoreFuncs.getChannel(team_id);
	await onboard.js.boardExistingChannel(app, context.botToken, team_id, newChannel);

	//have to update the app home
	//appHome.updateAppHome(body.user.id, body.team.id, context);
}
