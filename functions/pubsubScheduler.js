const index = require('./index')
const pairUp = require('./pairUp');
const schedule = require('./schedule');
const functions = require('firebase-functions');
const app = index.getBolt();
const firestoreFuncs = require('./firestore');

exports.scheduledPairUp = functions.pubsub
                            .schedule('every monday 08:00')
                            .timeZone('America/Los_Angeles')
                            .onRun(async (context) =>  {

  const allWorkspaces = await firestoreFuncs.getAllWorkspaces();

  for( i=0; i<allWorkspaces.length; i++){
    timedTask(i, allWorkspaces);
  }
  return null;
});

function timedTask(i, allWorkspaces){
  setTimeout(() => {
    const workspace = allWorkspaces[i];
    // if (  workspace !== "T0132A75VD3" && workspace !== "T0132A75VD3" ){
    //   return;
    // }
    firestoreFuncs.getAPIPair(workspace)
    .then( res => {
      return handleWorkspacePairup(workspace, res);
    }).catch(err => console.error(err));
  }, 3000 * i)
}
async function handleWorkspacePairup(workspace, apiPair){
        if(apiPair !== null){
          const botToken = apiPair.botToken;
          try{
            const pairUpResult = pairUp.pairUp(undefined, botToken);
            // console.log("Paired up workspace " + workspace)
            return pairUpResult;
          }catch(error){
            console.error("Could not schedule pair up for workspace " + workspace +
            ". This may be because the pairing channel might not be set up in firestore.")
          }

        }
        else{
          console.error("Could not schedule pair up for workspace " + workspace +
                        " because the api pair is not stored in firestore.")
        }
        return Promise.resolve();
}
exports.scheduleWarmup = functions.pubsub
                            .schedule('every mon,tue,wed,thu,fri 00:10')
                            .timeZone('America/Los_Angeles')
                            .onRun((context) => {
    app.use(({context}) => schedule.scheduleMsg(9, 0, "A reminder for warmup", "#general", context.botToken));
    return null;
});