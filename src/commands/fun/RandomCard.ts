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
 * Draws a random card from a deck
 * of playing cards
 * @author Spotlightsrule
 */
export default class RandomCard extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"randomcard", //NAME
		"Draws a random card from a deck of playing cards", //DESCRIPTION
		"randomcard [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["randomcard [none]"], //EXAMPLES
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
		["card", "deck", "drawcard", "gofish"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "RandomCard"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(RandomCard.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Set the arrays of card values, suit, and colors
		const cardValues:string[] = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
		const cardSuits:string[] = [":clubs:", ":diamonds:", ":hearts:", ":spades:"];
		const cardColors:string[] = ["Black", "Red"];

		//Pick a random value, suit, and color and respond to the user
		await message.reply(`You drew a ${cardColors[MathUtil.getRandomInt(0, (cardColors.length - 1))]} ${cardValues[MathUtil.getRandomInt(0, (cardValues.length - 1))]} of ${cardSuits[MathUtil.getRandomInt(0, (cardSuits.length - 1))]} from the deck!`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}