//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message } from "discord.js";
import fs from 'fs';
import { parse } from "querystring";

export default class BanRecent extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"banrecent", //NAME
		"Ban users who have recently joined the guild (raid protection)", //DESCRIPTION
		"banrecent (timeInMinutes)", //USAGE - [] = MANDATORY () = OPTIONAL
		["banrecent (5)", "banrecent"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		0, //MIN ARGS
		1, //MAX ARGS
		["BAN_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["antiraid", "br"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(BanRecent.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);
		
		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Check if the message type is direct
		if (message.channel.type === "dm") return message.author.send(":warning: This command may only be used on a server.");
		
		//Send the info message
		const m = await message.channel.send(":hourglass: One moment, please... ") as Discord.Message;

		let minutesToBanFrom;
		if(args[0]) minutesToBanFrom = Math.floor(parseInt(args[0]));
		else minutesToBanFrom = 5; // Default to 5 minutes if none is provided

		let timeStampToBanFrom = Date.now() - Math.floor(minutesToBanFrom * 1000);
		let membersToBan = await message.guild.members.cache.filter(m => m.joinedTimestamp >= timeStampToBanFrom &&! m.hasPermission(`MANAGE_MESSAGES`) &&! m.user.bot && m.bannable);

		if(!membersToBan || membersToBan.size < 1){
			return m.edit(`:no_entry: I was unable to ban any members that have joined from less than ${minutesToBanFrom} minutes ago!`);
		}

		let pulsarGuild = await bot.pulsarGuilds.get(message.guild.id);
		let guildConfig: any = pulsarGuild.config;
		let reportChannel;
		if(guildConfig.actionChannel) reportChannel = await bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;

		// Actually ban all of the users in the collection
		await AsyncForEachModule.prototype.asyncForEach(Array.from(membersToBan.values() ), async memberToBan => {
			await message.guild.members.ban(memberToBan.id, {days: 1, reason: `Recent User Purge - ${minutesToBanFrom} Minutes - ${message.author.tag}`});
			if(reportChannel){
				reportChannel.send(`:no_entry: **Banned User:** ${memberToBan.user.tag} (${memberToBan.user.id}) - Recent Account Purge (${minutesToBanFrom} minutes). Purged by ${message.author.tag} [${message.author.id}].`)
			}
		})

		await m.edit(`:white_check_mark: Banned ${membersToBan.size} recent accounts *(${minutesToBanFrom} minutes)*!`)
		if (message.member.hasPermission("MANAGE_CHANNELS") &&! reportChannel){
			const malert = await message.channel.send(":bulb: I can log this if you assign a action channel.") as Discord.Message;
			malert.delete({timeout: 5000});
		}

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}