import * as Discord from 'discord.js'; // for the typings
import Pulsar from '../handlers/Pulsar'; // for the typings
import {MacroAPI} from '../handlers/MacroAPI'; // for the typings

export let info = {
	name: `ResetAllNicknames`, // Macro name - Case Insensitive
	aliases: [`resetnicks`, `resetnicknames`, `resetallnicks`, `resetallnicknames`], // Other names for this macro - Case insensitive
	requiredArgs: 0 // The minimum amount of arguments required, if none are needed, keep this at 0
}

export async function run(bot: Pulsar, instanceInfo: any, MacroAPI: MacroAPI){
	
	// You have to use let inside of the function or else it wont work
	let discordModule = require(`discord.js`);

	(<Discord.Guild> instanceInfo.guild).members.cache.forEach(guildMember => {
		guildMember.setNickname(`${guildMember.user.username}`, `Reset Guild Nicknames`);
	})

	return;
}