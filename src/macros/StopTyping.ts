import * as Discord from 'discord.js'; // for the typings
import Pulsar from '../handlers/Pulsar'; // for the typings
import {MacroAPI} from '../handlers/MacroAPI'; // for the typings

export let info = {
	name: `StopTyping`, // Macro name - Case Insensitive
	aliases: [`st`], // Other names for this macro - Case insensitive
	requiredArgs: 1 // The minimum amount of arguments required, if none are needed, keep this at 0
}

export async function run(bot: Pulsar, instanceInfo: any, MacroAPI: MacroAPI){
	
	// You have to use let inside of the function or else it wont work
	let discordModule = require(`discord.js`);

	let args: string[] = instanceInfo.args;

	bot.guilds.cache.forEach(guild => {
		guild.channels.cache.forEach(channel => {
			try {
			if(channel.type === "text") return (<Discord.TextChannel> channel).stopTyping();
			}
			catch {null;}
		})
	})

	instanceInfo.message.reply(`:white_check_mark: Stopped typing in all textchannels!`);
}
