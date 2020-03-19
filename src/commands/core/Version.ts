//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";
import StringUtil from "../../util/StringUtil";
import Versioning from "../../modules/Versioning";

//Import core Node modules and dependencies
import Discord from "discord.js"

/**
 * Shows what version the bot is
 * @author Spotlightsrule
 */
export default class BotInfo extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"botversion", //NAME
		"Shows what version the bot is", //DESCRIPTION
		"botversion [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["botversion [none]"], //EXAMPLES
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
		["bversion", "v", "version"] //ALIASES
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

		//Construct a new instance of the versioning utility
		let botVersion:Versioning = new Versioning();

		//Get the bot's version from the version file
		let versionFile:string = (await botVersion.version());

		//Get the date of the last Git commit
		let lastCommit:Date = (await botVersion.lastCommit());

		//Create a variable to hold the Git version string
		let gitVersion:string = null;

		//Check if the last commit date is defined and not nul
		if(lastCommit && lastCommit !== null){
			//Populate the git version variable using the following format: GH-<year><date><month>
			gitVersion = (`GH-${lastCommit.getFullYear()}${StringUtil.zeroPrefix(lastCommit.getMonth() + 1)}${StringUtil.zeroPrefix(lastCommit.getDate())}`);
		}

		//Construct and return the bot info
		await message.reply(`:information_source: ${botClient.config.botName} is currently version ${(versionFile !== null) ? versionFile : "<unknown>"} ${(lastCommit !== null) ? "(" + gitVersion + ")" : ""}`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}