const index = require('./index')
const functions = require('firebase-functions');
const request = require('request')

//OAUTH API URL 
const apiUrl = "https://slack.com/api";


exports.oAuthFunction = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    if(!req.query.code) { 
        //access denied, reject. 
        console.log("access denied"); 
        return; 
    }
    var data = {form: { 
        // TODO: remove hardcoding and put these into node env
        client_id: "1109790171392.1098294088147", 
        client_secret: "a011f2998104ef3f3b39c81744db0f22", 
        code: req.query.code
    }};

   


    request.post(apiUrl + '/oauth.access', data, (error, response, body) => {
        if (!error && response.statusCode === 200) {
    
          // Get an auth token (and store the team_id / token)
          //storage.setItemSync(JSON.parse(body).team_id, JSON.parse(body).access_token);
    
          res.sendStatus(200);
          console.log("successfully sent");
          console.log(data); 
    
          // Show a nicer web page or redirect to Slack, instead of just giving 200 in reality!
          //res.redirect(__dirname + "/public/success.html");
        }else{
          console.log("unsuccessfully sent"); 
        }
      })

    // const original = req.query.text;
    // // Push the new message into the Realtime Database using the Firebase Admin SDK.
    // const snapshot = await admin.database().ref('/messages').push({original: original});
    // // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    //res.redirect(303, snapshot.ref.toString());
});