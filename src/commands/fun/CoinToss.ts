//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";

/**
 * Performs a random coin toss
 * @author Spotlightsrule
 */
export default class CoinToss extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"cointoss", //NAME
		"Performs a random coin toss", //DESCRIPTION
		"cointoss [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["cointoss [none]"], //EXAMPLES
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
		["coin", "coinflip", "ct", "flipcoin", "coinroll", "tosscoin", "tc"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "CoinToss"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(CoinToss.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Pick a random boolean and respond to the sender with either heads or tails
		await message.reply(`You tossed a coin and it landed on ${MathUtil.getRandomBool() ? "heads" : "tails"}.`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}