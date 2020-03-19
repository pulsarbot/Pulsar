//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

export default class MigrateBans extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"migratebans", //NAME
		"Copies the bans from one guild to another", //DESCRIPTION
		"migratebans [destination guild ID] (another destination guild id)", //USAGE - [] = MANDATORY () = OPTIONAL
		["migratebans 451248270409334796 637784721568563220"], //EXAMPLES
		CommandCategory.ADMINISTRATION, //CATEGORY
		1, //MIN ARGS
		6, //MAX ARGS
		["BAN_MEMBERS", "MANAGE_GUILD"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		120000, //SPAM TIMEOUT
		["copybans", "banmigration", "mb"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(MigrateBans.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		let selfMember: Discord.GuildMember = await message.guild.members.cache.get(bot.user.id);
		if(!selfMember ||! selfMember.hasPermission(`BAN_MEMBERS`)){
			return message.reply(`:no_entry: I do not have permission to access this guilds banlist!`);
		}

		let psGuild = await bot.pulsarGuilds.get(message.guild.id);
		let thisBanList = await psGuild.banlist.getEntries()
		let successfulMigrations = [];
		let failedMigrations = [];

		if(args[0]){
			let i: number = 0
			await AsyncForEachModule.asyncForEach(args, async guildID => {
				if(!await bot.pulsarGuilds.get(guildID)){
					failedMigrations.push(guildID)
					return;
				} else {
					let guild = await bot.pulsarGuilds.get(guildID)
					if(!guild.member(message.author.id)){
						failedMigrations.push(guildID);
						return;
					}
					let guildMemberDesGuild = await guild.members.cache.get(message.author.id)
					if(!guildMemberDesGuild.hasPermission("MANAGE_GUILD") ||! guildMemberDesGuild.hasPermission("BAN_MEMBERS")){
						failedMigrations.push(guildID);
						return;
					}
					await AsyncForEachModule.asyncForEach(thisBanList, async banListEntry => {
							let banReason = banListEntry.reason || "No Ban Reason Provided";
							guild.ban(banListEntry.id, {days: 1, reason: `Pulsar Ban Migration - ${banReason}`});
					})
					successfulMigrations.push(guildID);
				}
				
				i++
			})
		}

		if(args.length > 1 && successfulMigrations){
			if(successfulMigrations.length == args.length){
				return message.reply(`:white_check_mark: Successfully migrated ${thisBanList.length} bans to all of the guilds provided!`);
			}
			else{
				return message.reply(`:white_check_mark: Successfully migrated ${thisBanList.length} bans to ${successfulMigrations.length}/${args.length} guilds. Failed guild ids: \`${failedMigrations.join(", ")}\`. Make sure you have the \`MANAGE_GUILD\` and \`BAN_MEMBERS\` permission in all of the guilds provided!`);
			}
		}
		else if(args.length > 1 &&! successfulMigrations){
			return message.reply(`:no_entry: Failed migrating the bans to all of the guilds provided! Please make sure that the args are valid and you have permission in all of the guilds! Make sure you have the \`MANAGE_GUILD\` and \`BAN_MEMBERS\` permission in all of the guilds provided!`);
		}
		else {
			if(successfulMigrations){
				return message.reply(`:white_check_mark: Successfully migrated ${thisBanList.length} bans to the target guild ID!`);
			}
			else {
				return message.reply(`:no_entry: Failed migrating bans to the guild provided! Make sure you have the \`MANAGE_GUILD\` and \`BAN_MEMBERS\` permission in that guild!`);
			}
		}
	}
}