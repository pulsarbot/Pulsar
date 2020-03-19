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

export default class BlacklistGuildOwner extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"blacklistguildowner", //NAME
		"Blacklist a guild owner from having this bot inside of their guild!", //DESCRIPTION
		"blacklistguild [guildownerID] (guildownerID) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["blacklistguildowner [2738561891120] (abusing the bot)"], //EXAMPLES
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
		["bgo", "banguildowner", "banowner", "blacklistowner"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(BlacklistGuildOwner.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		// Testing
		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Assert the argument count
		super.assertArgCount(args.length, message);

		// Create new arrays
		let guildOwnerArray: string[] = [];
		let reasonArray: string[] = [];

		// Seperate all of the arguments into all of the arrays
		await AsyncForEachModule.asyncForEach(args, async item => {
			let itemFormatted: string = item.replace(/[^\w\s]/gi, '');
			if(!parseInt(itemFormatted) &&! bot.users.cache.has(itemFormatted)){ //the User ID doesn't exist and it cannot be parsed into an int, it must be a reason
				reasonArray.push(itemFormatted);
			}
			else if(bot.users.cache.has(itemFormatted) &&! bot.config.botAdmins.includes(itemFormatted)){
				guildOwnerArray.push(itemFormatted);
			}

		})


		let bannedGuildOwnerIDS: string = await fs.readFileSync('./data/guilds/bannedGuildOwners.txt', 'utf8');
		let bannedGuildOwnerWriteStream: WriteStream = await fs.createWriteStream('./data/guilds/bannedGuildOwners.txt', {flags: 'a'});
		let homeGuildReportChannel = await bot.channels.cache.get(bot.config.botChannels.botWideActions) as TextChannel;


		// Now go inside every guild owned by the user and leave it + add the user ID to the txt file
		await AsyncForEachModule.asyncForEach(guildOwnerArray, async ID => {
			try {
			let user = await bot.users.cache.get(ID);
			if(!bannedGuildOwnerIDS.includes(ID)){
				await bannedGuildOwnerWriteStream.write(ID + '\n');
			}
			let reason = reasonArray.join(" ") || "No Reason Provided";
			homeGuildReportChannel.send(`:no_entry: **Banned Guild Owner** - ${user.tag} [${user.id}] by ${message.author.tag} [${message.author.id}]. Reason: ${reason}`)
			let guildOwnedByUser = bot.pulsarGuilds.filter(guild => guild.ownerID == user.id);

			AsyncForEachModule.asyncForEach(guildOwnedByUser, async guild => {
				await guild.leave()
			});

			}
			catch {

				null;
			
			}
		})

		if(!guildOwnerArray ||! guildOwnerArray.join(', ')){
			return message.reply(`:x: I was unable to ban any of the guild ID's you provided! Make sure the bot has the user cached!`)
		}

		message.reply(`:white_check_mark: Banned Guild Owner IDs: \`${guildOwnerArray.join(", ")}\`!`)

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}