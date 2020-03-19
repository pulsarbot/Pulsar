const fs = require(`fs`);
const axios = require(`axios`);

module.exports = async function(bot, toReq): Promise<object> {

    // Sends a request to the Anti-Dox API by Severepain

    let apiConfig = require(`../../../data/modules/antidox/api-settings.json`); // Remember to always keep this file in the .gitignore


    let apiReqObj = {
        "apikey": apiConfig.apiKey,
        "username": apiConfig.apiUsername,
        "message": toReq
    };

    let returnObj = {        
    "isDox": false,
    "isBlacklisted": false,
    "isPossibleDox": false
};

    await axios.default.post(apiConfig.apiUrl, apiReqObj)
    .then(async (res) => { 

        returnObj.isDox = (res.data.doxEvent == true);
        returnObj.isBlacklisted = (res.data.blacklistedPhrase == true);
        returnObj.isPossibleDox = (res.data.possibleEvent == true);
    });


    return returnObj;

};