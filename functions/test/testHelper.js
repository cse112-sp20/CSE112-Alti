const admin = require('firebase-admin');
const index = require('../index');
const app = index.getBolt();
let db = admin.firestore();
let firestoreFuncs = require('../firestore');


setupPairs = async function(workspaceId, channelId)
{
  // Create new Channel "Pairing Channel"

  let pair1 = ["U01236C905V", "U012HPHS2FR"];
  let pair2 = ["U012P9C053Q", "U012RQ0TQG6"];
  let pair3 = ["U012X3JJS78", "U012YEB5HR8"];
  let pair4 = ["U012YGB2M50", "U0133SAJ0E7"];

  await firestoreFuncs.storeNewPairingChannel(workspaceId, channelId);

  createDmThread(pair1).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair1);
  });
  createDmThread(pair2).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair2);
  });
  createDmThread(pair3).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair3);
  });
  createDmThread(pair4).then(id => {
    return firestoreFuncs.storeNewPairing(workspaceId, id , pair4);
  });
  return Promise.resolve();
}

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

clearDatabase = async function(path)
{
  await deleteCollection(path, 100);
}


defaultPopulateUsers = async function(workspaceId) {
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
    userScheduleInfo = [{user1 = id, schedule1 = {see in default}}, {user2, schedule2 }, ...]
*/
customPopulateUsers = async function(workspaceId, userScheduleInfo) {
  /* eslint-disable no-await-in-loop */
  for(let i = 0; i < userScheduleInfo.length; i++) {
    user = userScheduleInfo[i].user;
    schedule = userScheduleInfo[i].schedule;
    await db.collection("workspaces").doc(workspaceId).collection("users").doc(user).set(schedule);
  } 
/* eslint-enable no-await-in-loop */
}
