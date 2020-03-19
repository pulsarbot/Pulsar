//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";
import MD5 from '../../util/MD5';

//Import core Node modules and dependencies
import Discord from "discord.js";
import randomPuppy from 'random-puppy';


export default class Bean extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"bean", //NAME
		"Sends a random image of B  E  A  N", //DESCRIPTION
		"bean [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["bean [none]"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
		0, //MIN ARGS
		0, //MAX ARGS
		["ATTACH_FILES", "EMBED_LINKS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		3000, //SPAM TIMEOUT
		["beanimage", "been", "beaaan"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "CoinToss"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Bean.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		if(!message.guild) return message.reply(`:warning: This command can only be used inside of a server!`);
		let self = await message.guild.members.cache.get(bot.user.id)
		if(self.hasPermission('EMBED_LINKS') == false || self.hasPermission('ATTACH_FILES') == false) return message.reply(`:x: I do not have permission to send images or embed links in this channel!`)
	
		let reddit = [
			"BeansInThings"
		]
	
		let subreddit = reddit[Math.floor(Math.random() * reddit.length)];
	
		randomPuppy(subreddit).then(async url => {
				await message.channel.send({
					files: [{
						attachment: url,
						//Set the filename to be the name relevant for this command plus the MD5 of the URL
						name: ('bean-thing-' + (await MD5.md5(url)) + '.png')
					}]
				}).then(() => message.channel.stopTyping());
		}).catch(err => console.error(err));

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}