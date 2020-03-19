//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Interpreter from "../../modules/commandapi/interpreter/Interpreter";
import Pulsar from "../../handlers/Pulsar";
import StringUtil from "../../util/StringUtil";

//Import core Node modules and dependencies
import Discord from "discord.js";

/**
 * Prints a list of all the valid 
 * commands that the bot can accept
 * @author Spotlightsrule
 */
export default class CommandList extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"commandlist", //NAME
		"Prints a list of all the valid commands that the bot can accept", //DESCRIPTION
		"commandist (category)", //USAGE - [] = MANDATORY () = OPTIONAL
		["commandlist [none]", "commandlist moderation"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		0, //MIN ARGS
		1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		3000, //SPAM TIMEOUT
		["allcommands", "list"] //ALIASES
	);

	//Set class variables
	private cmdInterpreter:Interpreter

	/**
	 * Constructs a new instance of the "CommandList"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console, cmdInterpreter:Interpreter){
		//Call the superclass with the command fields
		super(CommandList.commandFields, cmdConsole);

		//Assign the class variables from the constructor's parameters
		this.cmdInterpreter = cmdInterpreter;
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Check if the sender sent an option to view a specific category of command
		if(args.length >= 1){
			//Check if the input category matches a valid category
			if((args[0].toUpperCase()) in CommandCategory){
				//Derive the command category object via reflection
				let validCat:CommandCategory = Reflect.get(CommandCategory, args[0].toUpperCase());

				//Reply with only the commands in that category
				await message.reply(`Commands in the category "${CommandCategory[validCat].toLowerCase()}": \`${this.cmdInterpreter.getRegisteredCommandList(validCat)}\``);
			}
			else {
				//Warn that an invalid category was passed and suggest the valid options
				await message.reply(`Sorry, but "${args[0].toLowerCase()}" is not a valid command category. The available categories are: \`${CommandCategory.values()}\`.`);
			}
		}
		else {
			//Send the full command list
			await message.reply(`Full command list: \`${this.cmdInterpreter.getRegisteredCommandList()}\``);
		}

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}