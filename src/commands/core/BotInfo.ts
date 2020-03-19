//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";

/**
 * Shows how many users, guilds, 
 * and channels the bot knows of
 * @author Spotlightsrule
 */
export default class BotInfo extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"botinfo", //NAME
		"Shows how many users, guilds, and channels the bot knows of", //DESCRIPTION
		"botinfo [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["botinfo [none]"], //EXAMPLES
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
		3000, //SPAM TIMEOUT
		["botstats", "globalstats", "pulsarinfo", "stats"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "BotInfo"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(BotInfo.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Respond with the bot's statistics
		await message.reply(`:bulb: I am a member of ${botClient.guilds.cache.array().length} servers. I know a total of ${botClient.users.cache.array().length} users and ${botClient.channels.cache.array().length} channels.`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}