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
 * A magic 8-ball that will randomly
 * respond with either a yes, no, or uncertain
 * answer to a question
 * @author Spotlightsrule
 * @see https://en.wikipedia.org/wiki/Magic_8-Ball
 */
export default class EightBall extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"8ball", //NAME
		"A magic 8-ball that will randomly respond with either a yes, no, or uncertain answer to a question", //DESCRIPTION
		"8ball [question]", //USAGE - [] = MANDATORY () = OPTIONAL
		["8ball [will I be rich in the future?]"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
		0, //MIN ARGS
		-1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		3000, //SPAM TIMEOUT
		["8b", "eightball", "oracle"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "EightBall"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(EightBall.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Set the array of responses
		const eightBallResponses:string[] = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."];

		//Pick a random response and respond to the sender with that response
		await message.reply(`:8ball: ${eightBallResponses[MathUtil.getRandomInt(0, (eightBallResponses.length - 1))]}`);

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}