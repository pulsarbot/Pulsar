//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";
import Fortune from "fortune-teller";

/**
 * Selects a random fortune
 * @author Spotlightsrule
 */
export default class FortuneTeller extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"fortuneteller", //NAME
		"Selects a random fortune", //DESCRIPTION
		"fortuneteller [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["fortuneteller [none]"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
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
		["fcookie", "fortunecookie", "fortune"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "FortuneTeller"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(FortuneTeller.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Pick a fortune and reply to thr sender with it
		await message.reply(`:fortune_cookie: ${Fortune.fortune()}`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}