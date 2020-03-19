//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";
import MD5 from '../../util/MD5';

//Import core Node modules and dependencies
import Discord, { Message } from "discord.js";
import randomPuppy from 'random-puppy';


export default class Say extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"say", //NAME
		"Says what you say", //DESCRIPTION
		"say [thing to say]", //USAGE - [] = MANDATORY () = OPTIONAL
		["meme [none]"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["repeat", "saymessage", "send"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "CoinToss"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Say.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);
		message.delete();
		return message.channel.send(args.join(" "));
	}
}