import * as Discord from 'discord.js'; // for the typings
import Pulsar from '../handlers/Pulsar'; // for the typings
import {MacroAPI} from '../handlers/MacroAPI'; // for the typings

export let info = {
	name: `DeleteChannel`, // Macro name - Case Insensitive
	aliases: [`RemoveChannel`, `delchan`], // Other names for this macro - Case insensitive
	requiredArgs: 1 // The minimum amount of arguments required, if none are needed, keep this at 0
}

export async function run(bot: Pulsar, instanceInfo: any, MacroAPI: MacroAPI){
	
	// You have to use let inside of the function or else it wont work
	let discordModule = require(`discord.js`);

	let args: string[] = instanceInfo.args;
	console.log(args)
	if(!(<Discord.Guild> instanceInfo.guild).channels.cache.has(args[0])) throw new MacroAPI.MacroError(`The channel provided is not a valid channel in this guild`, info);
	let channelToDelete = await instanceInfo.message.guild.channels.get(args[0]) as Discord.GuildChannel;

	let guild = await channelToDelete.guild;
	let botMember = await guild.members.cache.get(bot.user.id)
	if(!botMember.hasPermission("MANAGE_CHANNELS")) throw new MacroAPI.MacroError(`I do not have permission to manage channels in this guild`, info);

	if(!channelToDelete.deletable) throw new MacroAPI.MacroError(`I do not have permission to delete that channel!`, info);

	instanceInfo.message.reply(`:white_check_mark: Deleted GuildChannel ${channelToDelete} (${channelToDelete.name}) [${channelToDelete.id}]!`)
	return channelToDelete.delete(`Macro triggered by ${instanceInfo.user.tag}`);
}