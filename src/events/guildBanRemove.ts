import { bot } from '../index';
import * as fs from 'fs';


bot.on(`guildBanRemove`, async function(guild, user){

    if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) return;
    let bannedUsers = require(`./data/guilds/${guild.id}/banned-users.json`);


    try{
        delete bannedUsers[user.id];
        fs.writeFile(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify(bannedUsers), error => {
            if (error){
                console.log(`[ERROR] Couldn't access banned-users.json! (guildBanRemove.ts) ` + error);
            }
        });
    } catch (error) {
        null;
    }

});
