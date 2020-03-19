//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

export default class Level extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"level", //NAME
		"Shows a users OBH guild level", //DESCRIPTION
		"level (@user/userID)", //USAGE - [] = MANDATORY () = OPTIONAL
		["level", "level (@severepain#0001)"], //EXAMPLES
		CommandCategory.CUSTOM, //CATEGORY
		0, //MIN ARGS
		1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		["451248270409334796", "544276344792678410"], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		10000, //SPAM TIMEOUT
		["showlevel", "ranking", "rank"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Level.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		let userLevelsJSON: object = await JSON.parse(fs.readFileSync(`./data/modules/bh/levels.json`).toString());

		let userToCheck;
		if(args[0]) userToCheck = await bot.users.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		if(!userToCheck && args[0]){
			return message.reply(`:no_entry: \`${args[0]}\` is not a valid user!`);
		}

		if(!args[0]){
			userToCheck = message.author;
		}

		if(!userLevelsJSON.hasOwnProperty(userToCheck.id)){
			return message.reply(`:x: That user doesn't have a level!`);
		}
		else {
			let messagesInWeek = userLevelsJSON[userToCheck.id]
			return message.channel.send(`User **${userToCheck.tag}** has a level/message count of **${messagesInWeek.toString()}**!`)
		}

}

}
