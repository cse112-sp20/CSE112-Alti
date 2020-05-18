// File containing all the utility functions


// Given a channel name, returns the channel ID.
exports.getChannelIdByName = async function getChannelIdByName(app, token, channelName){
    const conversations = app.client.conversations.list({
        token:token
    });
    const channelId = conversations.then( conversations => {
        const filteredChannels = conversations.channels.filter( channel => {
            if(channel.name === channelName){
                return true;
            }
            else return false;
        })

        if (filteredChannels.length === 0){
            console.error("Target channel not found");
            return undefined;
        }
        if (filteredChannels.length > 1){
            console.error("Multiple channels found");
            return undefined;
        }

        return filteredChannels[0].id;
    });
    return channelId;
}