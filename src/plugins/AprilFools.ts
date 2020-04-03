import * as Discord from 'discord.js';
import * as fs from 'fs';
import Pulsar from '../handlers/Pulsar';

module.exports.run = async (bot: Pulsar) => {

let moduleActive = false
let obhGuildID = "451248270409334796";

	if(!moduleActive) return;
	
	if((new Date().getMonth() !== 4) && (new Date().getDate() !== 1)) return; //Don't activate the module if the date is not 4/1

    bot.on("message", async (message) => {
        // If there is no guild, return
        if(!message.guild) return;

		if(message.author.id === "436972719054127105") return; //Chip Kipperly is special
	    
	    if(message.member.nickname && message.member.nickname.length > 3 && message.guild.id === obhGuildID && message.content.length > 3 &&! message.author.bot && message.author.id !== bot.user.id &&! message.member.hasPermission("MANAGE_MESSAGES")){
		    let guildMember = message.member;
	    		let usernameString = await message.author.tag.substring(0,2) // Get the first 2 characters
			await guildMember.setNickname(usernameString);
	    }
		// Delete the message if it is longer than 2 characters
		if(message.guild.id === obhGuildID && message.content.length > 3 &&! message.author.bot && message.author.id !== bot.user.id &&! message.member.hasPermission("MANAGE_MESSAGES")){
			message.delete();
		}
			
    });
	
    bot.on("messageUpdate", async (oldMessage, newMessage) => {
		
		let message = newMessage;

		if(message.author.id === "436972719054127105") return; //Chip Kipperly is special
		
        // If there is no guild, return
        if(!message.guild) return;
		// Delete the message if it is longer than 2 characters
		if(message.guild.id === obhGuildID && message.content.length > 3 &&! message.author.bot && message.author.id !== bot.user.id &&! message.member.hasPermission("MANAGE_MESSAGES")){
			message.delete();
		}
			
    });
	
	bot.on("ready", async() => { 
		let obhGuild = await bot.guilds.cache.get(obhGuildID);
		
		obhGuild.members.cache.forEach(async guildMember => {
			try {
			let member = guildMember;
			if(member.nickname && member.nickname.length < 3) return;
			let usernameString = await guildMember.user.tag.substring(0,2) // Get the first 2 characters
			await guildMember.setNickname(usernameString);
			}
			catch {
				null;
			}
		})
	})
    
	bot.on("guildMemberUpdate", async (oldMember, newMember) => {
		try {
		if(oldMember.guild.id === obhGuildID && newMember.guild.id === obhGuildID){
			let guildMember = newMember;
			let usernameString = guildMember.user.tag.substring(0,2) // Get the first 2 characters
			if(newMember.nickname && newMember.nickname.length < 3) return;
                        guildMember.setNickname(usernameString)
		}
		}
		catch {
			null;
		}
	})
};

module.exports.info = {
    "name": "April-Fools",
    "author": "severepain",
    "version": "1.0.0",
    "info": "Buddhism Hotline April Fools 2020!"
}
