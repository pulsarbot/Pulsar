//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { GuildMember, MessageEmbed, TextChannel, Message } from "discord.js";
import PulsarGuild from "../../handlers/PulsarGuild";
import fs, { WriteStream } from 'fs';

export default class Help extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"help", //NAME
		"Links a user to the website", //DESCRIPTION
		"help [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["help [none]"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		0, //MIN ARGS
		0, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["info", "commands", "invite"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Help.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Reply with the address of the Pulsar homepage
		await message.reply(`:information_source: **${bot.config.botName} Help**\n- Configuration: ${bot.config.botHomepage}/servers\n- Commands List: ${bot.config.botHomepage}/commands\n- Invite to your guild: ${bot.config.inviteURL}`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}