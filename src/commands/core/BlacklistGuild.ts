//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { GuildMember, MessageEmbed, TextChannel, Message } from "discord.js";
import PulsarGuild from "../../handlers/PulsarGuild";
import fs, { WriteStream } from 'fs';

export default class BlacklistGuild extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"blacklistguild", //NAME
		"Blacklist a guild from having this bot inside of it!", //DESCRIPTION
		"blacklistguild [guildID] (guildID) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["blacklistguild [2738561891120] (abusing the bot)"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
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
		["bg", "banguild"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(BlacklistGuild.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		
		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Assert the argument count
		super.assertArgCount(args.length, message);

		// Create new arrays
		let guildIDArray: string[] = [];
		let reasonArray: string[] = [];

		// Seperate all of the arguments into all of the arrays
		await AsyncForEachModule.asyncForEach(args, async item => {
			if(!parseInt(item) &&! bot.guilds.cache.has(item)){ // It is not a guild and it cannot be parsed into an int, it must be a reason
				reasonArray.push(item)
			}
			else if(bot.guilds.cache.has(item)){
				guildIDArray.push(item)
			}

		})


		let bannedGuildIDS: string = await fs.readFileSync('./data/guilds/bannedGuilds.txt', 'utf8');
		let bannedGuildsWriteStream: WriteStream = await fs.createWriteStream('./data/guilds/bannedGuilds.txt', {flags: 'a'});
		let homeGuildReportChannel = await bot.channels.cache.get(bot.config.botChannels.botWideActions) as TextChannel;


		// Now go inside every guild and leave it + add it to the txt file
		await AsyncForEachModule.asyncForEach(guildIDArray, async ID => {
			try {
			let guild = await bot.pulsarGuilds.get(ID);
			if(!bannedGuildIDS.includes(ID)){
				await bannedGuildsWriteStream.write(ID + '\n');
			}
			let reason = reasonArray.join(" ") || "No Reason Provided";
			homeGuildReportChannel.send(`:no_entry: **Banned Guild** - ${guild.name} [${guild.id} | Owner: ${guild.owner.user.tag} (${guild.owner.user.id})] by ${message.author.tag} [${message.author.id}]. Reason: ${reason}`)
			await guild.leave();
			}
			catch {

				null;
			
			}
		})

		if(!guildIDArray ||! guildIDArray.join(', ')){
			return message.reply(`:x: I was unable to ban any of the guild ID's you provided! Make sure the bot is inside of the guild ID you provided!`)
		}

		message.reply(`:white_check_mark: Banned Guild IDs: \`${guildIDArray.join(", ")}\`!`)

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}