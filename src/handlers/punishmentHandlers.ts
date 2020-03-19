import fs from 'fs';
import Discord, { GuildChannel, SnowflakeUtil } from 'discord.js';
import Pulsar from './Pulsar';


/*
 *
 * The following module was provided by my friend Kaimund600's GautamaBuddha (and Shibe) project and under the direct permission of Kaimund600#0600! 
 * The code for that (private) project is licensed under GPL-3.0 [https://www.gnu.org/licenses/gpl-3.0.en.html]
 * Please support Kaimund600 and his other projects on GitHub at https://github.com/Kaimund600
 * https://kaimund600.org
 * 
 */



// I am going to be honest, I have no idea how this code works but it just does so..... ¯\_(ツ)_/¯
// Big thanks to Kaimund for this lmfao


// TODO: Make this more efficient + maybe make it a class (??????)

export default class ModerationTimer {

    public constructor (bot: Pulsar) {

        let client = bot;

        client.setInterval(async () => {

            // Cycle through each guild in index - Mutes
            for (let selectedGuild of client.guilds.cache) {

                const guild = selectedGuild[1];
                let psGuild = bot.pulsarGuilds.get(guild.id);

                // Try to get muted users - continue if this is not possible
                if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) continue;
                let mutedUsers = require(`../../data/guilds/${guild.id}/muted-users.json`);

                // Look through each entry in the muted users directory
                for (let i in mutedUsers) {
                    let caseID = mutedUsers[i].caseID;
                    let caseOBJ = psGuild.getCase(caseID);
                    // Import guild and member information
                    const member = guild.members.cache.get(i);

                    // Find the 'Muted' role, and skip if none exists
                    const mutedRole = guild.roles.cache.find(r => r.name === `Muted`);
                    if (!mutedRole) continue;

                    // Check if the listed mute has expired
					if(!mutedUsers[i].time) continue;
                    if (Date.now() > SnowflakeUtil.deconstruct(mutedUsers[i].caseID).timestamp) {

                        if(!member.roles.cache.has(mutedRole.id)){
                            delete mutedUsers[i];
                            psGuild.resolveCase(member.id, caseID, `mute`);
                            fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify(mutedUsers));                            
                            continue;
                        }

                        // Actually unmute the member
                        member.roles.remove(mutedRole).catch(() => {});
                        member.voice.setMute(false, `Mute Expired`).catch(() => {});
                        psGuild.resolveCase(member.id, caseID, `mute`);

                        // Remove the entry from the mute directory and write back
                        delete mutedUsers[i];
                        try {

                            fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify(mutedUsers));

                            // Log to action channel if one exists
                            let guildConfig = require(`../../data/guilds/${guild.id}/config.json`); // Import the configuration for the relevant guild
                            const actionChannel = client.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;

                            if (actionChannel) {
                                const reportEmbed = new Discord.MessageEmbed()
                                    .setAuthor(`Mute Expired`, client.user.avatarURL())
                                    .setThumbnail(member.user.avatarURL())
                                    .setColor(`#00ff7f`)
                                    .addField(`User`, `<@${member.id}> (${member.user.tag})`)
                                    .setTimestamp()
                                    .setFooter(`ID: ${caseID}`);
                                actionChannel.send(reportEmbed).catch(() => {});
                            }

                            // Try to contact the person over DM to notify of mute expiry
                            member.user.send(`:loud_sound: Your mute on **${guild.name}** has expired.`).catch(() => {});
                            psGuild.resolveCase(member.id, caseID, `mute`);
                        } catch (error) {
                            // Error Unmuting
                            console.error(`Unable to unmute a member. ${error.stack}`);
                        }
                    }
                }

                // Ditto with Image Mutes

                if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) continue;
                let imageMutedUsers = require(`../../data/guilds/${guild.id}/image-muted-users.json`);
                                // Look through each entry in the muted users directory
                                for (let i in imageMutedUsers) {
                                    let caseID = imageMutedUsers[i].caseID;
                                    // Import guild and member information
                                    const member = guild.members.cache.get(i);
                
                                    // Find the 'Muted' role, and skip if none exists
                                    const mutedRole = guild.roles.cache.find(r => r.name === `Image Muted`);
                                    if (!mutedRole) continue;
                
                                    // Check if the listed mute has expired
									if(!imageMutedUsers[i].time) continue;
                                    if (Date.now() >  SnowflakeUtil.deconstruct(imageMutedUsers[i].caseID).timestamp) {

                                        if(!member.roles.cache.has(mutedRole.id)){
                                            delete imageMutedUsers[i];
                                            psGuild.resolveCase(member.id, caseID, `image mute`);
                                            fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify(imageMutedUsers));                            
                                            continue;
                                        }

                                        // Actually unmute the member
                                        member.roles.remove(mutedRole).catch(() => {});
                                        psGuild.resolveCase(member.id, caseID, `image mute`);
                                        // Remove the entry from the mute directory and write back
                                        delete imageMutedUsers[i];
                                        try {
                
                                            fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify(imageMutedUsers));
                
                                            // Log to action channel if one exists
                                            let guildConfig = require(`../../data/guilds/${guild.id}/config.json`); // Import the configuration for the relevant guild
                                            const actionChannel = client.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;
                
                                            if (actionChannel) {
                                                const reportEmbed = new Discord.MessageEmbed()
                                                    .setAuthor(`Image Mute Expired`, client.user.avatarURL())
                                                    .setThumbnail(member.user.avatarURL())
                                                    .setColor(`#00ff7f`)
                                                    .addField(`User`, `<@${member.id}> (${member.user.tag})`)
                                                    .setTimestamp()
                                                    .setFooter(`ID: ${caseID}`);
                                                actionChannel.send(reportEmbed).catch(() => {});
                                            }
                
                                            // Try to contact the person over DM to notify of mute expiry
                                            member.user.send(`:loud_sound: Your image posting perms on **${guild.name}** have returned.`).catch(() => {});
                
                                        } catch (error) {
                                            // Error Unmuting
                                            console.error(`Unable to unimute a member. ${error.stack}`);
                                        }
                                    }
                                }
                                
                // Ditto with Voice Mutes
                if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) continue;
                let voiceMutedUsers = require(`../../data/guilds/${guild.id}/voice-muted-users.json`);
                                // Look through each entry in the muted users directory
                                for (let i in voiceMutedUsers) {
                                    let caseID = voiceMutedUsers[i].caseID;

                                    // Import guild and member information
                                    const member = guild.members.cache.get(i);
                
                                    // Find the 'Muted' role, and skip if none exists
                                    const mutedRole = guild.roles.cache.find(r => r.name === `Voice Muted`);
                                    if (!mutedRole) continue;
                
                                    // Check if the listed mute has expired
									if(!voiceMutedUsers[i].time) continue;
                                    if (Date.now() > SnowflakeUtil.deconstruct(voiceMutedUsers[i].caseID).timestamp) {
                                        
                                        if(!member.roles.cache.has(mutedRole.id)){
                                            delete voiceMutedUsers[i];
                                            psGuild.resolveCase(member.id, caseID, `voice mute`);
                                            fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify(voiceMutedUsers));                            
                                            continue;
                                        }

                                        // Actually unmute the member
                                        member.roles.remove(mutedRole).catch(() => {});
                                        psGuild.resolveCase(member.id, caseID, `voice mute`);
                                        // Remove the entry from the mute directory and write back
                                        delete voiceMutedUsers[i];
                                        try {
                
                                            fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify(voiceMutedUsers));
                
                                            // Log to action channel if one exists
                                            let guildConfig = require(`../../data/guilds/${guild.id}/config.json`); // Import the configuration for the relevant guild
                                            const actionChannel = client.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;
                
                                            if (actionChannel) {
                                                const reportEmbed = new Discord.MessageEmbed()
                                                    .setAuthor(`Voice Mute Expired`, client.user.avatarURL())
                                                    .setThumbnail(member.user.avatarURL())
                                                    .setColor(`#00ff7f`)
                                                    .addField(`User`, `<@${member.id}> (${member.user.tag})`)
                                                    .setTimestamp()
                                                    .setFooter(`ID: ${caseID}`);
                                                actionChannel.send(reportEmbed).catch(() => {});
                                            }
                
                                            // Try to contact the person over DM to notify of mute expiry
                                            member.user.send(`:loud_sound: Your voice mute on **${guild.name}** has expired.`).catch(() => {});
                
                                        } catch (error) {
                                            // Error Unmuting
                                            console.error(`Unable to unvmute a member. ${error.stack}`);
                                        }
                                    }
                                }

            }

            // Cycle through each guild in index - Bans
            for (let selectedGuild of client.guilds.cache) {

                // Import Guild Information
                const guild = selectedGuild[1];
                let psGuild = bot.pulsarGuilds.get(guild.id)
                // Try to get banned users - continue if this is not possible
                if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) continue;
                let bannedUsers = require(`../../data/guilds/${guild.id}/banned-users.json`);

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
                    if (Date.now() > SnowflakeUtil.deconstruct(bannedUsers[bannedUsersEntry].caseID).timestamp) {

                        // Actually unban the member
                        guild.members.unban(bannedUsersEntry, `Ban Expired`).catch(() => {});

                        try {

                            // Log to action channel if one exists
                            let guildConfig = require(`../../data/guilds/${guild.id}/config.json`); // Import the configuration for the relevant guild
                            const actionChannel = client.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;

                            if (actionChannel) {
                                if (!bannedUsers[bannedUsersEntry].reason) bannedUsers[bannedUsersEntry].reason = `No reason provided`;
                                const reportEmbed = new Discord.MessageEmbed()
                                    .setAuthor(`Ban Expired`, client.user.avatarURL())
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
                            const user = client.users.cache.get(bannedUsersEntry);
                            if (user) user.send(`:white_check_mark: Your ban on **${guild.name}** has expired.`).catch(() => {});

                        } catch (error) {
                            // Error Unbanning
                            console.error(`Unable to unban a member. ${error.stack}`);
                        }
                    }
                }
            }
        }, 5000); // Repeat every 5 seconds

    } // End constructor

}
