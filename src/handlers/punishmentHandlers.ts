import fs from 'fs';
import {MessageEmbed, TextChannel } from 'discord.js';
import Pulsar from './Pulsar';

type muteKind = `regular` | `default` | `mute` | `image` | `voice`; // Custom type for muteKinds

type specificMute = `mute` | "image mute" | "voice mute";

interface muteEntry {
    "time"?: number,
    "reason"?: string,
    "caseID": string,
    "moderatorID": string,
    "type": specificMute,
    "userID": string
}

type guildMuteFile = {
    [affectedUserID: string]: muteEntry
};


function checkMutes(bot: Pulsar, muteType: muteKind): void {
    bot.guilds.cache.forEach(async guild => {
        let guildMutes: guildMuteFile, guildPath: string, muteVer: string;
        let pulsarGuild = await bot.pulsarGuilds.get(guild.id);

        if(muteType == "regular" || muteType == "default" || muteType == "mute"){
            guildMutes = pulsarGuild.muted_users as guildMuteFile;
            guildPath = `./data/guilds/${guild.id}/muted-users.json`
            muteVer = "Mute"
        }
        else if(muteType == "image"){
            guildMutes = pulsarGuild.image_muted_users as guildMuteFile;
            guildPath = `./data/guilds/${guild.id}/image-muted-users.json`
            muteVer = "Image Mute"
        }
        else if(muteType == "voice"){
            guildMutes = pulsarGuild.voice_muted_users as guildMuteFile;
            guildPath = `./data/guilds/${guild.id}/voice-muted-users.json`
            muteVer = "Voice Mute"               
        }
        if (!fs.existsSync(guildPath)) return;

        for(let muteItemPos in guildMutes){
            let muteItem: muteEntry = guildMutes[muteItemPos];

            if(!muteItem.time) continue; // The mute time is infinite 
            let role = guild.roles.cache.find(role => role.name === `${muteVer}d`);

            if(Date.now() > muteItem.time){
                // Mute is expired
                let guildConfig: any = pulsarGuild.config;

                let member = await guild.members.cache.get(muteItem.userID) || null;

                pulsarGuild.resolveCase(muteItem.userID, muteItem.caseID, muteType);

                if(!member){ 
                    delete guildMutes[muteItemPos];
                    fs.writeFileSync(guildPath, JSON.stringify(guildMutes, null, 4));
                    continue;
                 } // The user is no longer in the guild

                 if(muteType == "voice" || muteType == "regular" || muteType == "default" || muteType == "mute"){
                     try{
                    await member.voice.setMute(false, `User Mute Expired.`);
                     }
                     catch {
                         null
                     }
                 }

                 if(member.roles.cache.has(role.id)){
                     member.roles.remove(role, `User ${muteVer} Expired.`);
                 }

                let muteExpiredEmbed = new MessageEmbed()
                    .setAuthor(`${muteVer} Expired`, bot.user.avatarURL())
                    .setThumbnail(member.user.avatarURL())
                    .setColor(`#00ff7f`)
                    .addField(`User`, `<@${member.id}> (${member.user.tag})`)
                    .setTimestamp()
                    .setFooter(`ID: ${muteItem.caseID}`);
                if(guildConfig.actionChannel){
                    try {
                        let configChannel = await guild.channels.cache.get(guildConfig.actionChannel) as TextChannel;
                        configChannel.send(muteExpiredEmbed).catch(() => {});
                    }
                    catch {null;}
                }

                delete guildMutes[muteItemPos];

                let muteExpiredMessage: string;
                if(muteType == "regular" || muteType == "default" || muteType == "mute"){
                    muteExpiredMessage = `:loud_sound: Your mute on **${guild.name}** has expired.`;
                    pulsarGuild.muted_users = guildMutes;
                }
                else if(muteType == "image"){
                    muteExpiredMessage = `:loud_sound: Your image posting perms on **${guild.name}** have returned.`;
                    pulsarGuild.image_muted_users = guildMutes;
                }
                else if(muteType == "voice"){
                    muteExpiredMessage = `:loud_sound: Your voice mute on **${guild.name}** has expired.`;
                    pulsarGuild.voice_muted_users = guildMutes;
                }

                fs.writeFileSync(guildPath, JSON.stringify(guildMutes, null, 4));
                member.user.send(muteExpiredMessage).catch(() => {});
                continue;
            } 
        }

        return null;

    })
}

/*
*
* The following code to manage guild bans was provided by my friend Kaimund600's GautamaBuddha (and Shibe) project and under the direct permission of Kaimund600#0600! 
* The code for that (private) project is licensed under GPL-3.0 [https://www.gnu.org/licenses/gpl-3.0.en.html]
* Please support Kaimund600 and his other projects on GitHub at https://github.com/Kaimund600
* https://kaimund600.org
* 
*/

// Big thanks to Kaimund for this lmfao

function checkBans(bot: Pulsar): void {
        // Cycle through each guild in index - Bans
        bot.guilds.cache.forEach(async guild => {
            // Import Guild Information
            let psGuild = bot.pulsarGuilds.get(guild.id)
            // Try to get banned users - continue if this is not possible
            if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) return;
            let bannedUsers = JSON.parse(fs.readFileSync(`./data/guilds/${guild.id}/banned-users.json`).toString());

            // Look through each entry in the banned users directory
            for (let bannedUsersEntry in bannedUsers) {
                if(!psGuild.banlist.isBanned(bannedUsers[bannedUsersEntry].userID)){
                     // Remove the entry from the ban directory
                    delete bannedUsers[bannedUsersEntry];
                    // Write back to database
                    fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify(bannedUsers));
                    continue;
                }
                // Check if the listed ban has expired
                if(!bannedUsers[bannedUsersEntry].time) continue;
                if (Date.now() > bannedUsers[bannedUsersEntry].time) {

                    // Actually unban the member
                    guild.members.unban(bannedUsersEntry, `Ban Expired`).catch(() => {});

                    try {

                        // Log to action channel if one exists
                        let guildConfig: any = psGuild.config; // Import the configuration for the relevant guild
                        const actionChannel = bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;

                        if (actionChannel) {
                            if (!bannedUsers[bannedUsersEntry].reason) bannedUsers[bannedUsersEntry].reason = `No reason provided`;
                            const reportEmbed = new MessageEmbed()
                                .setAuthor(`Ban Expired`, bot.user.avatarURL())
                                .setThumbnail(bannedUsers[bannedUsersEntry].avatar)
                                .setColor(`#00d2ef`)
                                .addField(`User`, `<@${bannedUsersEntry}> (${bannedUsers[bannedUsersEntry].username})`)
                                .addField(`Reason`, bannedUsers[bannedUsersEntry].reason)
                                .setTimestamp()
                                .setFooter(`ID: ${bannedUsers[bannedUsersEntry].caseID}`);
                            actionChannel.send(reportEmbed).catch(() => {});
                        }
                        psGuild.resolveCase(bannedUsersEntry, bannedUsers[bannedUsersEntry].caseID, `ban`);
                        // Remove the entry from the ban directory
                        delete bannedUsers[bannedUsersEntry];

                        // Write back to database
                        fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify(bannedUsers));

                        // Try to contact the person over DM to notify of ban expiry
                        const user = bot.users.cache.get(bannedUsersEntry);
                        if (user) user.send(`:white_check_mark: Your ban on **${guild.name}** has expired.`).catch(() => {});

                    } catch (error) {
                        // Error Unbanning
                        console.error(`Unable to unban a member. ${error.stack}`);
                    }
                }
            }
        })

}

export default class ModerationTimer {

    public constructor (bot: Pulsar) {
        console.log(`[PUNISHMENT HANDLER] Moderation Timer Started!`);

        // Create all of the files needed
        bot.guilds.cache.forEach(guild => {
            if(!fs.opendirSync(`./data/guilds/${guild.id}`)) fs.mkdirSync(`data/guilds/${guild.id}`);
            if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/config.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/config.json`, JSON.stringify({
                "reportChannel": false,
                "cguild": true,
                "actionChannel": false,
                "funCommands":true,
                "doxEnabled": true,
                "reportNewAcc": false,
                "customBannedWords": [``],
                "logChannel": false,
                "imageLogChannel": false,
                "starBoardChannel": false,
                "starsNeeded": 10
                    }));
        });

        checkMutes(bot, `mute`);
        checkMutes(bot, `image`);
        checkMutes(bot, `voice`);
        checkBans(bot);

        bot.setInterval(async function(){
            checkMutes(bot, `mute`);
            checkMutes(bot, `image`);
            checkMutes(bot, `voice`);
            checkBans(bot);
        }, 5000); // Repeat every 5 seconds

    } // End constructor


}
