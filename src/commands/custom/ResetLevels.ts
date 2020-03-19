//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

export default class ResetLevels extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"resetlevels", //NAME
		"Resets all of the levels in a guild", //DESCRIPTION
		"resetlevels", //USAGE - [] = MANDATORY () = OPTIONAL
		["resetlevels"], //EXAMPLES
		CommandCategory.CUSTOM, //CATEGORY
		0, //MIN ARGS
		1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		["451248270409334796", "544276344792678410"], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["clearlevels"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(ResetLevels.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		let userLevelsJSON: object = await JSON.parse(fs.readFileSync(`./data/modules/bh/levels.json`).toString());

		for(var prop in userLevelsJSON){
			userLevelsJSON[prop] = 0;
		}

		await fs.writeFileSync(`./data/modules/bh/levels.json`, JSON.stringify(userLevelsJSON, null, 4));

		return message.reply(`:no_entry: Reset all of the levels in the Buddhism Hotline guild!`)

	}

}
