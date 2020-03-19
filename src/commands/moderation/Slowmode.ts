//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

export default class Slowmode extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"slowmode", //NAME
		"Adds a slowmode timer into the channel the command message was sent in", //DESCRIPTION
		"slowmode [timeInSeconds]", //USAGE - [] = MANDATORY () = OPTIONAL
		["slowmode [4]", "slowmode [0]"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["antispam", "messagetimelimit"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Slowmode.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		let self = await message.guild.members.cache.get(bot.user.id);

		if(!self.hasPermission("MANAGE_CHANNELS")) return message.reply(`:x: I do not have the \`MANAGE_CHANNELS\` permission so I cannot set a slowmode timer in this channel!`);

		if(!parseInt(args[0]) && parseInt(args[0]) !== 0){
			return message.reply(`:x: ${bot.config.prefix}${Slowmode.commandFields.usage}`);
		}

		let secondsToSlowmodeFor = Math.floor(parseInt(args[0]));

		if(secondsToSlowmodeFor > 120){
			return message.reply(`:no_entry: The highest slowmode timer you can set is 120 seconds!`)
		}

		let channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(secondsToSlowmodeFor, `Slowmode set by ${message.author.tag} [${message.author.id}]`);

		return message.channel.send(`:white_check_mark: Slowmode timer set for ${secondsToSlowmodeFor} seconds!`);
	}

}
