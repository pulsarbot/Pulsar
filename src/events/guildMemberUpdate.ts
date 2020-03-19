import { bot } from '../index';
import { TextChannel, User } from 'discord.js';
const config = require(`../../data/config.json`);
let fs = require(`fs`);
import * as Discord from 'discord.js';

let antiDoxScreen = require(`../modules/Antidox/antiDoxScreen`);

bot.on(`guildMemberUpdate`, async function(oldMember, newMember) {

	let guild = oldMember.guild
	let pulsarGuild = await bot.pulsarGuilds.get(oldMember.guild.id);

	if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
	let nicknameHistoryJSON = JSON.parse(fs.readFileSync(`./data/guilds/${guild.id}/nickname-history.json`).toString());

	let newMemberUserID = newMember.user.id;

	// Limit the nickname history to 8 entries per a user
	let guildNickHistory = pulsarGuild.nickname_history;

	for(var prop in guildNickHistory){
		if(guildNickHistory[prop].length > 8){
			guildNickHistory[prop] = guildNickHistory[prop].slice(Math.max(guildNickHistory[prop].length - 8, 0)); // Last 8 entries
		}
    }
    await fs.writeFileSync(`./data/guilds/${pulsarGuild.id}/nickname-history.json`, JSON.stringify(guildNickHistory, null, 4));
    
	// New Nickname
	if(newMember.nickname && oldMember.nickname && oldMember.nickname !== newMember.nickname){

		
	let writeObj = {
		"newNickname": newMember.nickname,
		"oldNickname": oldMember.nickname,
		"timestamp": Date.now(),
		"type": "nickChange"
	}
		
		if(!nicknameHistoryJSON[newMember.user.id]){
			nicknameHistoryJSON[newMemberUserID] = [writeObj]
		}
		else {
			nicknameHistoryJSON[newMemberUserID].push(writeObj)
		}

	}	
	else if(!oldMember.nickname && newMember.nickname){ // Member created new nickname

		let writeObj = {
			"newNickname": newMember.nickname,
			"oldNickname": null,
			"timestamp": Date.now(),
			"type": "newNick"
		}
			
			if(!nicknameHistoryJSON[newMember.user.id]){
				nicknameHistoryJSON[newMemberUserID] = [writeObj]
			}
			else {
				nicknameHistoryJSON[newMemberUserID].push(writeObj)
			}

	}
	else if(oldMember.nickname &&! newMember.nickname){ // Member Reset their nickname
	
		let writeObj = {
			"newNickname": null,
			"oldNickname": oldMember.nickname,
			"timestamp": Date.now(),
			"type": "nickReset"
		}
			
			if(!nicknameHistoryJSON[newMember.user.id]){
				nicknameHistoryJSON[newMemberUserID] = [writeObj]
			}
			else {
				nicknameHistoryJSON[newMemberUserID].push(writeObj)
			}
	
	}

	fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify(nicknameHistoryJSON, null, 4)); // Write the file with the new data

    let guildOwner = await bot.fetchUser(newMember.guild.ownerID) as User;

    // Import the configuration for the guild
    let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${oldMember.guild.id}/config.json`, `utf8`).toString());

    // Guild Variables
    let isGuildDoxEnabled = guildConfig.doxEnabled;
    let guildReportChannel = await bot.channels.cache.get(guildConfig.reportChannel) as TextChannel;

    let masterGuildReportChannel = await bot.channels.cache.get(config.botChannels.doxeventchannelid) as TextChannel;


    let blacklistedNicknamesInfo = JSON.parse(fs.readFileSync(`./data/blacklistedNicknames.json`));

    if(newMember.nickname && blacklistedNicknamesInfo.blacklistedNicknames.includes(newMember.nickname.toLowerCase()) && oldMember.guild.id == config.OBHGuildID){
        newMember.setNickname(oldMember.user.username + ` `);
    }


    blacklistedNicknamesInfo.blacklistedStarts.forEach(item => {
        if(newMember.nickname && oldMember.guild.id == config.OBHGuildID && newMember.nickname.toLowerCase().startsWith(item.toLowerCase())){
            newMember.setNickname(oldMember.user.username + ` `);
        }
    });

    const colors = {
        "darkRed": `750000`,
        "red": `ff0400`,
        "darkBlue": `000da7`,
        "blue": `00c5ff`,
        "purple": `bd00ff`,
        "lime": `1fff00`,
        "darkGreen": `007525`,
        "black": `000000`,
        "white": `ffffff`
    };

    let member = newMember;

    if (!member.nickname) return;

    // Creating the rich embed for reporting
    let reportEmbed = new Discord.MessageEmbed()
        .setColor(`#${colors.black}`)
        .setThumbnail(member.guild.iconURL())
        .setAuthor(`Dox Nickname Event Occured`, member.user.displayAvatarURL())
        .addField(`User`, `<@${member.id}> (${member.user.tag}) [${member.user.id}]`)
        .addField(`User was banned`, `${(member.bannable && isGuildDoxEnabled).toString()}`)
        .addField(`Guild Has Antidox Enabled`, `${isGuildDoxEnabled.toString()}`)
        .addField(`Guild`, `${member.guild.name} [${member.guild.id}] (Owned By <@${guildOwner.id}> ${guildOwner.tag} [${guildOwner.id}])`)
        .addField(`Offending Nickname`, `|| ${member.nickname} ||`)
        .setTimestamp()
        .setFooter(`${config.botName} - Buddhism Hotline Antidox`);


    let nicknameIsDox = await antiDoxScreen.checkDox(newMember.nickname.toLowerCase());

    if (isGuildDoxEnabled && newMember.nickname && !member.user.bot) {

        if (nicknameIsDox) {
            let loggingJson = JSON.parse(fs.readFileSync(`./data/doxEvents.json`).toString());
            // Push the event to the array
            loggingJson.push({"userID": member.id, "userTag": member.user.tag, "guildInfo": `${member.guild.name} [${member.guild.id}] (Owned By ${member.guild.owner.user.tag} [${member.guild.owner.user.id}])`, "User Bannable": member.bannable,  "nickname":`${member.nickname}`, "time": Date.now()});
            await fs.writeFileSync(`./data/doxEvents.json`, JSON.stringify(loggingJson, null, 4)); // Log to the file
            if (newMember.bannable) {
                await masterGuildReportChannel.send(reportEmbed);
                try {
                    await guildReportChannel.send(reportEmbed);
                } catch {
                    null;
                }
                try {
                    await member.guild.members.ban(member.id, {
                        reason: `Doxing - Bannable Nickname`,
                        days: 1
                    });
                    await member.setNickname(`${member.user.username}`, `Dox words found in nickname`);
                } catch {
                    null;
                }
                return;


            } else {
                await masterGuildReportChannel.send(reportEmbed);
                try {
                    member.setNickname(`${member.user.username}`, `Dox words found in nickname`);
                } catch {
                    null;
                }
            }


        }

    } else if (nicknameIsDox) {
        await masterGuildReportChannel.send(reportEmbed);
        try {
            member.setNickname(`${member.user.username}`, `Dox words found in nickname`);
        } catch {
            null;
        }
        return;
    }

});