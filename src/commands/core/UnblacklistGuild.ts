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

export default class UnblacklistGuild extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"unblacklistguild", //NAME
		"Remove a guild from the blacklist!", //DESCRIPTION
		"unblacklistguild [guildID] (guildID) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["unblacklistguild [2738561891120] (changed owner)"], //EXAMPLES
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
		["ubg", "unbanguild"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(UnblacklistGuild.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Assert the argument count
		super.assertArgCount(args.length, message);

		// Create new arrays
		let guildIDArray: string[] = [];
		let reasonArray: string[] = [];

		
		let bannedGuildIDS: string = await fs.readFileSync('./data/guilds/bannedGuilds.txt', 'utf8');
		let bannedGuildsWriteStream: WriteStream = await fs.createWriteStream('./data/guilds/bannedGuilds.txt');
		let homeGuildReportChannel = await bot.channels.cache.get(bot.config.botChannels.botWideActions) as TextChannel;

		// Seperate all of the arguments into all of the arrays
		await AsyncForEachModule.prototype.asyncForEach(args, async item => {
			if(!parseInt(item) &&! bannedGuildIDS.includes(item)){ // It is not a guild and it cannot be parsed into an int, it must be a reason
				reasonArray.push(item)
			}
			else if(bannedGuildIDS.includes(item)){
				guildIDArray.push(item)
			}

		})

		// Now go inside every guild and remove it to the txt file
		await AsyncForEachModule.prototype.asyncForEach(guildIDArray, async ID => {
			try {
				bannedGuildIDS = bannedGuildIDS.replace(`${ID}\n`, ``);
				bannedGuildsWriteStream.write(bannedGuildIDS);
				let reason = reasonArray.join(" ") || "No Reason Provided";
				homeGuildReportChannel.send(`:white_check_mark: **Unbanned Guild:** ${ID} by ${message.author.tag} [${message.author.id}]. Reason: ${reason}`);
			}
			catch {
				null;
			}
		})

		if(!guildIDArray ||! guildIDArray.join(', ')){
			return message.reply(`:x: I was unable to unban any of the guild ID's you provided! Make sure the guild is actually banned!`);
		}

		message.reply(`:white_check_mark: Unbanned Guild IDs: \`${guildIDArray.join(", ")}\`!`)

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}