const functions = require('firebase-functions');
const request = require('request')
const firestore = require('./firestore')
const config = functions.config();
const client_id = config.slack.client_id;
const client_secret = config.slack.client_secret;

//OAUTH API URL 
let apiUrl = "https://slack.com/api";


exports.oAuthFunction = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    if(!req.query.code) { 
        //access denied, reject. 
        console.log("access denied"); 
        return; 
    }
   
    var options = {
      uri: 'https://slack.com/api/oauth.v2.access?code='
          +req.query.code+
          '&client_id='+  client_id + 
          '&client_secret=' + client_secret,//+
          //'&redirect_uri='+REDIRECT_URI,
      method: 'GET'
    }

    request(options, (error, response, body) => {
      var JSONresponse = JSON.parse(body)
      if (!JSONresponse.ok){
          res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
      }else{
          res.send("Success!")
          let api_keys = JSONresponse; 
          let botID = "";

          options = {
            uri: 'https://slack.com/api/auth.test?token='
                +api_keys.access_token,
            method: 'GET'
          }

          let getBotID = (callback)=> { 
            request.get(options, (e, res, bd) => {
              if (!e && res.statusCode === 200) {
                console.log(JSON.parse(bd));
                botID = JSON.parse(bd).bot_id;
                return callback(true, botID);
              } else {
                return callback(false, botID);
              }
            });
          }
          
          getBotID((e1, data)=> { 
            if(e1) {
              let auth_info = { 
                botToken: api_keys.access_token,
                botId: data,
                botUserId: api_keys.bot_user_id
              }
    
              console.log(api_keys.team.id); 
              console.log(auth_info);
    
    
              firestore.storeAPIPair(api_keys.team.id,
                auth_info
              );
            } else { 
              throw new Error("authentication error");
            }
          });

            
            
      }
    })
});