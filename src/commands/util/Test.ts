//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pair from "../../util/Pair";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";

/**
 * A test command that should not
 * be loaded
 * @author Spotlightsrule
 */
export default class Test extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"test", //NAME
		"A test command that should not be loaded", //DESCRIPTION
		"test [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["test"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		0, //MIN ARGS
		-1, //MAX ARGS
		["SEND_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		10000, //SPAM TIMEOUT
		["dryrun", "testcommand"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Test.commandFields, cmdConsole);

		console.log("It didn't work :(");
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count (Pass one less than the actual count due to args[0] always being the command name)
		super.assertArgCount((args.length - 1), message);

		message.channel.send("It didn't work :(");
		
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}