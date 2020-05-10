
const shuffle = require('shuffle-array');

exports.pairUp = async function pairUp(app, token){
    try{
        const {members} = await app.client.users.list({
            token:token
        });
   
        // Get the human users among all users
        const users = Array.from(members);
        const humans = users.filter( user => {
            //SlackBot is includeded now for testing purposes, need to filter that out too.
            return !user.is_bot && user.id!=='USLACKBOT';
        });

        if(humans.length <= 1){
            console.log("Could not pair since there is less than 2 people in the workspace");
            return;
        }
        var ids = humans.map( human => human.id );

        // Randomize the order of people
        shuffle(ids);

        for (i = 0; i < ids.length/2; i++) {
            
            // var pair = new Array(ids[i], ids[i]);
            // console.log(pair);
            
            var responsePromise = app.client.conversations.open({
                token: token,
                return_im: false,
                users: ids[i]+','+ids[(ids.length/2) + i]
            })
            responsePromise.then(response => handlePairingResponse(response, app, token))
                                .catch(console.error);

        }

    }
    catch(error){
        console.error(error);
    }
}
async function handlePairingResponse(response, app, token){

    if(!response.ok){
        return console.error(response.error);
    }
    // app.client.conversations.join({
    //     token: token,
    //     channel: response.channel.id
    // });
    return app.client.chat.postMessage({
        token: token,
        channel: response.channel.id,
        text: "You ppl just got paired!"
    });
}

// export{ pairUp };