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

export default class UnblacklistGuildOwner extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"unblacklistguildowner", //NAME
		"Remove a guild owner from the blacklist!", //DESCRIPTION
		"unblacklistguild [guildownerID] (guildownerID) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["unblacklistguildowner [2738561891120] (reformed)"], //EXAMPLES
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
		["ubgo", "unbanguildowner", "unblacklistowner", "unbanowner"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(UnblacklistGuildOwner.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Assert the argument count
		super.assertArgCount(args.length, message);

		let bannedGuildOwnerIDS: string = await fs.readFileSync('./data/guilds/bannedGuildOwners.txt', 'utf8');
		let bannedGuildOwnerWriteStream: WriteStream = await fs.createWriteStream('./data/guilds/bannedGuildOwners.txt');
		let homeGuildReportChannel = await bot.channels.cache.get(bot.config.botChannels.botWideActions) as TextChannel;

		// Create new arrays
		let guildOwnerArray: string[] = [];
		let reasonArray: string[] = [];

		// Seperate all of the arguments into all of the arrays
		await AsyncForEachModule.asyncForEach(args, async item => {
			let itemFormatted: string = item.replace(/[^\w\s]/gi, '');
			if(!parseInt(itemFormatted) &&! bannedGuildOwnerIDS.includes(itemFormatted)){ //the User ID doesn't exist and it cannot be parsed into an int, it must be a reason
				reasonArray.push(itemFormatted);
			}
			else if(bannedGuildOwnerIDS.includes(itemFormatted)){
				guildOwnerArray.push(itemFormatted);
			}

		})

		// Now go inside every guild owned by the user and leave it + add the user ID to the txt file
		await AsyncForEachModule.asyncForEach(guildOwnerArray, async ID => {
			try {
			if(bannedGuildOwnerIDS.includes(ID)){
				bannedGuildOwnerIDS = bannedGuildOwnerIDS.replace(`${ID}\n`, ``);
				await bannedGuildOwnerWriteStream.write(bannedGuildOwnerIDS);
			}
			let reason = reasonArray.join(" ") || "No Reason Provided";
			homeGuildReportChannel.send(`:white_check_mark: **Unbanned Guild Owner** - ${ID} by ${message.author.tag} [${message.author.id}]. Reason: ${reason}`)
			}
			catch {
		
				null;
					
			}
		})

		if(!guildOwnerArray ||! guildOwnerArray.join(', ')){
			return message.reply(`:x: I was unable to unban any of the guild owner ID's you provided! Make sure this owner is banned!`);
		}
		
		message.reply(`:white_check_mark: Unbanned Guild Owner IDs: \`${guildOwnerArray.join(", ")}\`!`);


	}
}