const admin = require('firebase-admin');
const index = require('../index');
const app = index.getBolt();
let db = admin.firestore();
let firestoreFuncs = require('../firestore');

let defaultDocInfo = {'botToken':'fake_token', 'note': 'this is Alti-Test', 
'owner' : 'U012HPHS2FR', 'time' : '-07:00'};

/* 
    Removes the workspace from firebase. This is necessary to avoid test conflicts
    Input:
        workspaceId: The id of the workspace that will be removed from /workspaces
*/
exports.deleteWorkspace = async function(workspaceId) {
  let snapshot = await db.collection('workspaces').get();
  let batch = db.batch();
  await snapshot.docs.forEach((doc) => {
    if(doc.id === workspaceId)
    {
      //console.log(doc.id);
      batch.delete(doc.ref);
    }
    //console.log(doc.ref);
  });
  return await batch.commit();
}

/*
    Creates the workspace and add the necessary info. 
    Input:
      workspaceId: the id of workspace
      docInfo: any additional fields. The default value is what we have for Alti-Test 
*/
exports.setupWorkspace = async function(workspaceId, docInfo=defaultDocInfo) {
    await db.collection('workspaces').doc(workspaceId).set(docInfo);
}

/*
    Create pairs in firebase. Use this before testing functions that
    assumes pairs have been made. All the id references can be found at the bottom
    of this file

    Input: 
      workspaceId: the id of workspace
      channelId: the channel
*/
exports.setupPairs = async function(workspaceId, channelId) {

    let pair1 = ["U01236C905V", "U012HPHS2FR"];
    let pair2 = ["U012P9C053Q", "U012RQ0TQG6"];
    let pair3 = ["U012X3JJS78", "U012YEB5HR8"];
    let pair4 = ["U012YGB2M50", "U0133SAJ0E7"];

    await firestoreFuncs.storeNewPairingChannel(workspaceId, channelId);

    createDmThread(pair1).then(id => {
        return firestoreFuncs.storeNewPairing(workspaceId, id , pair1);
    }).catch(error => {});
    createDmThread(pair2).then(id => {
        return firestoreFuncs.storeNewPairing(workspaceId, id , pair2);
    }).catch(error => {});
    createDmThread(pair3).then(id => {
        return firestoreFuncs.storeNewPairing(workspaceId, id , pair3);
    }).catch(error => {});
    createDmThread(pair4).then(id => {
        return firestoreFuncs.storeNewPairing(workspaceId, id , pair4);
    }).catch(error => {});
    return Promise.resolve();
}

/* 
  A helpfer function for setupPairs. 
  This create pairs on the slack end in Alti-Test workspace 
*/
async function createDmThread(users)
{
  var check = await app.client.conversations.open({
    token: token, 
    return_im: false,
    users: users[0] + "," + users[1]
  });

  app.client.chat.postMessage({
    token:token,
    channel: (check.channel).id, 
    text: "Testing making thread with api"
  });

  return check.channel.id;
}

/*
  The default way to populate user info with schedule in firebase
  Default for warmup time is 9am and cool down time is 5pm
*/
exports.defaultPopulateUsers = async function(workspaceId) {
  let schedule = {'FridayEnd': '5:00 PM',
                  'ThursdayEnd': '5:00 PM',
                  'WednesdayEnd': '5:00 PM',
                  'TuesdayEnd': '5:00 PM',
                  'MondayEnd': '5:00 PM',
                  'FridayStart': '9:00 AM',
                  'ThursdayStart': '9:00 AM',
                  'WednesdayStart': '9:00 AM',
                  'TuesdayStart': '9:00 AM', 
                  'MondayStart': '9:00 AM'};
  let users = ["U01236C905V", "U012HPHS2FR",
               "U012P9C053Q", "U012RQ0TQG6" ,
               "U012X3JJS78", "U012YEB5HR8" , 
               "U012YGB2M50", "U012YNT21C3" ,
               "U0132DWLTT7", "U0133SAJ0E7" ,
               "U01341THLV9", "U01341VGSE7" ,
               "U0134PZ89UL", "U013G97PNFK"];
  
  /* eslint-disable no-await-in-loop */
  for(let i = 0; i < users.length; i++)
    await db.collection("workspaces").doc(workspaceId).collection("users").doc(users[i]).set(schedule);
  /* eslint-enable no-await-in-loop */
}

/*
    Customize the way you want to populate user data in firebase. 
    Input: 
      userScheduleInfo = [{user1 = id, schedule1 = {see in default}}, {user2, schedule2 }, ...]
*/
exports.customPopulateUsers = async function(workspaceId, userScheduleInfo) {
  /* eslint-disable no-await-in-loop */
  for(let i = 0; i < userScheduleInfo.length; i++) {
    user = userScheduleInfo[i].user;
    schedule = userScheduleInfo[i].schedule;
    await db.collection("workspaces").doc(workspaceId).collection("users").doc(user).set(schedule);
  } 
  /* eslint-enable no-await-in-loop */
}


/* All the user ids we have in Alti-Test */
// U01236C905V Ani
// U012HPHS2FR Daniel
// U012P9C053Q Jeremiah
// U012RQ0TQG6 Alvin
// U012X3JJS78 Shardul Bot
// U012YEB5HR8 Jonathan Leigh
// U012YGB2M50 Rahul
// U012YNT21C3 Him Li
// U0132DWLTT7 Lacey Umamoto
// U0133SAJ0E7 Jason Ding
// U01341THLV9 Brent Vanzant
// U01341VGSE7 Thomas Limperis
// U0134PZ89UL Eric Wei
// U013G97PNFK Ruixan Song


