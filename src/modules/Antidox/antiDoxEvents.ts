const fs = require(`fs`);
import { bot } from '../../index';
const config = require(`../../../data/config.json`);
let antiDoxPlugin = require(`./antiDoxScreen`);
import StringUtil from "../../util/StringUtil";
import * as Discord from 'discord.js';

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
    
    let caughtBlacklistedMSG = `:no_entry: Your message was denied because it contained a blacklisted item. *Offending Item:* *{message}*`;
    let doxCaughtMSG = `:no_entry: You were auto-banned for doxxing in {guildname}. Please contact a moderator if you believe this is in error`;

async function messageAntiDox(message: Discord.Message): Promise<void>{

    if(!message.guild) return;
    if(message.channel.type !== `text`) return;

		if(message.guild.id === "691833256055799829") return;
    let messageChannel = message.channel as Discord.TextChannel;

//Check for literals
let isDoxLiteral = await antiDoxPlugin.checkDox(message.content);

//Check for acronyms
let isDoxAcro = await antiDoxPlugin.checkDox(await StringUtil.toAcronym(message.content));

//Combine both booleans (will resolve true if either or both are true)
let doxOccured = (isDoxLiteral || isDoxAcro);

let guildOwner = await bot.fetchUser(message.guild.ownerID);


// Log the event if it happened
if(doxOccured){
console.log(`Dox Event Occured! ${message.guild.name} [${message.guild.id} || Owner ID: ${message.guild.ownerID}] > #${messageChannel.name} > ${message.author.tag} [${message.author.id}]: ${message.content}`);
}

// Import the configuration for the guild
let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${message.guild.id}/config.json`, `utf8`)); 

// Guild Variables
let isGuildDoxEnabled = guildConfig.doxEnabled;
let guildReportChannel = await bot.channels.cache.get(guildConfig.reportChannel) as Discord.TextChannel;



    // Creating the rich embed for reporting
    let reportEmbed = new Discord.MessageEmbed()
    .setColor(`#${colors.black}`)
    .setThumbnail(message.guild.iconURL())
    .setAuthor(`Dox Event Occured`, message.author.displayAvatarURL())
    .addField(`User`, `<@${message.author.id}> (${message.author.tag}) [${message.author.id}]`)
    .addField(`User was banned`, `${(message.member.bannable && isGuildDoxEnabled).toString()}`)
    .addField(`Guild Has Antidox Enabled`, `${isGuildDoxEnabled.toString()}`)
    .addField(`Guild`, `${message.guild.name} [${message.guild.id}] (Owned By <@${guildOwner.id}> ${guildOwner.tag} [${guildOwner.id}])`)
    .addField(`Message Content`, `|| ${message.content} ||`)
    .setTimestamp()
    .setFooter(`${config.botName} - Buddhism Hotline Antidox`);

let masterGuildReportChannel = await bot.channels.cache.get(config.botChannels.doxeventchannelid) as Discord.TextChannel;



// Handling the dox event

    if(doxOccured){

        if(!bot.botAdmins.includes(message.author.id)){
            let loggingJson = JSON.parse(fs.readFileSync(`./data/doxEvents.json`).toString());

            let messageChannelTemp = message.channel as Discord.TextChannel;
            // Push the event to the array
            loggingJson.push({"userID": message.author.id, "userTag": message.author.tag, "guildInfo": `${message.guild.name} [${message.guild.id}] (Owned By ${guildOwner.tag} [${guildOwner.id}])`, "User Bannable": message.member.bannable, "channelInfo": `#${messageChannelTemp.name} (${message.channel.id})`, "message":`${message.content}`, "time": Date.now()});
            await fs.writeFileSync(`./data/doxEvents.json`, JSON.stringify(loggingJson, null, 4)); // Log to the file
        }

        if(guildReportChannel && isGuildDoxEnabled){

           await guildReportChannel.send(reportEmbed);
           await masterGuildReportChannel.send(reportEmbed);

           try{
           await message.delete();
           }
           catch {
               null;
           }
           if(message.member.bannable){ 
            await message.guild.members.ban(message.author.id, {reason: `Doxing - Bannable Message`, days: 1}); // Ban the member and delete 1 day worth of messages
            
            try {
               await message.author.send(doxCaughtMSG.replace(`{guildname}`, `${message.guild.name}`));
            }
            catch {
                null;
            }
        }
           return;

        }
        else if(isGuildDoxEnabled){
            await masterGuildReportChannel.send(reportEmbed);
            try{
                await message.delete();
                }
                catch {
                    null;
                }
            if(message.member.bannable){ 
                await message.guild.members.ban(message.author.id, {reason: `Doxing - Bannable Message`, days: 1}); // Ban the member and delete 1 day worth of messages
                
                try {
                   await message.author.send(doxCaughtMSG.replace(`{guildname}`, `${message.guild.name}`));
                }
                catch {
                    null;
                }
            }
            return;
        }

        else if(!isGuildDoxEnabled){

            await masterGuildReportChannel.send(reportEmbed);
            try{
                await message.delete();
                }
                catch {
                    null;
                }
            return;
        }


    }


}

async function messageBlacklisted(message: Discord.Message): Promise<void> {

    if(!message.guild) return;
    if(message.channel.type !== `text`) return;

	if(message.guild.id === "691833256055799829") return;
	
    let messageChannel = message.channel as Discord.TextChannel;

    //Check for literals
    let isBlacklistedLiteral = await antiDoxPlugin.checkBlacklisted(message.content);
    
    //Check for acronyms
    let isBlacklistedAcro = await antiDoxPlugin.checkBlacklisted(await StringUtil.toAcronym(message.content));
    
    //Combine both booleans (will resolve true if either or both are true)
    let blacklistedOccured = (isBlacklistedAcro || isBlacklistedLiteral);
    
    // Import the configuration for the guild
    let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${message.guild.id}/config.json`, `utf8`)); 
    
    // Guild Variables
    let guildReportChannel = await bot.channels.cache.get(guildConfig.reportChannel) as Discord.TextChannel;

    let masterGuildReportChannel = await bot.channels.cache.get(config.botChannels.doxeventchannelid) as Discord.TextChannel;
    


    let reportEmbed = `:no_entry: A **Blacklisted Message** event has occurred! ${message.guild.name} [${message.guild.id}] > #${messageChannel.name} > ${message.author.tag} [${message.author.id}]: *${message.content}*`;
    
    // Handling the blacklisted event
    
        if(blacklistedOccured){
    
    
            if(guildReportChannel){
    
               await guildReportChannel.send(reportEmbed);
               await masterGuildReportChannel.send(reportEmbed);
               await message.delete();
               await message.author.send(caughtBlacklistedMSG.replace(`{message}`, `${message.content}`));
               return;
    
            }
            else {
                await masterGuildReportChannel.send(reportEmbed);
                await message.delete();
                await message.author.send(caughtBlacklistedMSG.replace(`{message}`, `${message.content}`));
                return;
            }

    
        }
    
    
    }


module.exports.messageAntiDox = messageAntiDox;
module.exports.messageBlacklisted = messageBlacklisted;