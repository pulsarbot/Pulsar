import * as Discord from 'discord.js'; // for the typings
import Pulsar from '../handlers/Pulsar'; // for the typings
import {MacroAPI} from '../handlers/MacroAPI'; // for the typings

export let info = {
	name: `UnbanUser`, // Macro name - Case Insensitive
	aliases: [`unban`, `ub`], // Other names for this macro - Case insensitive
	requiredArgs: 1 // The minimum amount of arguments required, if none are needed, keep this at 0
}

export async function run(bot: Pulsar, instanceInfo: any, MacroAPI: MacroAPI){
	
	// You have to use let inside of the function or else it wont work
	let discordModule = require(`discord.js`);

	let args: string[] = instanceInfo.args;
	console.log(args)
	if(!bot.users.cache.has(args[0].replace(/[^\w\s]/gi, ''))) throw new MacroAPI.MacroError(`The user provided is not a valid user that the bot can fetch`, info);
	let userToUnBan = await bot.users.cache.get(args[0].replace(/[^\w\s]/gi, '')) as Discord.User;

	let guild = await instanceInfo.guild;
	let botMember = await guild.members.get(bot.user.id)
	if(!botMember.hasPermission("BAN_MEMBERS")) throw new MacroAPI.MacroError(`I do not have permission to ban users in this guild`, info);

	let psGuild = await bot.pulsarGuilds.get(guild.id);
	if(!await psGuild.banlist.isBanned(userToUnBan.id)) throw new MacroAPI.MacroError(`That user is not banned in this guild`, info);
	else await psGuild.unban(userToUnBan.id, `Macro triggered by ${instanceInfo.user.tag}`);

	return instanceInfo.message.reply(`:white_check_mark: Force unbanned user ${userToUnBan.tag} (${userToUnBan.id})!`)
}