//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message } from "discord.js";
import fs from 'fs';

export default class Unban extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"unban", //NAME
		"Unban users from a guild", //DESCRIPTION
		"unban [userID], (userID), (userID)....", //USAGE - [] = MANDATORY () = OPTIONAL
		["unban [294239711780798465]", "unban [258757935377809409] (362938646304653312) (294239711780798465)"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		50, //MAX ARGS
		["BAN_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		false, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["ub", "massunban", "unb", "unbanuser", "unbanusers"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Unban.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
	
		class afeM {
				/**
				 * Runs a forEach loop asynchronously. EXAMPLE:
				 * AsyncUtil.asyncForEach(arr, async(i, callback) => {<stuff>});
				 * @deprecated Use the module in src/util/AsyncUtil instead
				 * @author SeverePain
				 * @param T Allows generic types to be used
				 * @param array The array to iterate over
				 * @param callback The callback function to call
				 * @return <b>Promise<void></b> The result of the callback function
				 */
				public async asyncForEach<T>(array:T[], callback:any): Promise<void> {
					for(let index = 0; index<array.length; index++){
						await callback(array[index], index, array);
					}
				}
		}
		
		let AsyncForEachModule = new afeM();
		
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		//Check if the message type is direct
		if (message.channel.type === "dm") return message.author.send(":warning: This command may only be used on a server.");
		
		//Send the info message
		const m = await message.channel.send(":hourglass: One moment, please... ") as Discord.Message;

		// No arguments
		if (!args[0]) return m.edit(`:information_source: The correct usage is: ${bot.config.prefix}${Unban.commandFields.usage}`);

		// Bot has no permission
		if(!message.member.guild.me.hasPermission("BAN_MEMBERS")) return m.edit(":no_entry: I do not have permission to unban members.");

		let psGuild = await bot.pulsarGuilds.get(message.guild.id);
		let guildConfig: any = psGuild.config;

		let failedBans = [];
		let successBans = [];


		await AsyncForEachModule.asyncForEach(args, async currentID => {
			let currentUser: Discord.User;

			try {
				await bot.fetchUser(currentID);
			}
			catch {
				failedBans.push({"entered": currentID});
				return;
			}

			currentUser = await bot.fetchUser(currentID);

			if(!await psGuild.banlist.isBanned(currentUser.id)){
				failedBans.push({"tag": currentUser.tag, "id": currentUser.id});
				return;
			}
			else {
				if(psGuild.temp_banned_users[currentUser.id]){
					psGuild.deleteTempBannedUserEntry(currentUser.id)
				}
				message.guild.members.unban(currentUser.id, `Unbanned by ${message.author.tag}`);
				    // Try to report
					if(guildConfig.actionChannel) {
						let reportEmbed = new Discord.MessageEmbed()
						.setAuthor("Unban", message.author.displayAvatarURL())
						.setThumbnail(currentUser.displayAvatarURL())
						.setColor("#00d2ef")
						.addField("User", `<@${currentUser.id}> (${currentUser.tag})`)
						.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
						.setTimestamp()
						.setFooter(`ID: ${currentUser.id}`)
						let toReportChan = bot.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;
						toReportChan.send(reportEmbed);
					}
					successBans.push(`${currentUser.tag} [${currentUser.id}]`);
			}
		})

		if(args.length > 1 && successBans.length >= 1){
			await m.edit(`<@${message.author.id}> :white_check_mark: Successfully unbanned ${args.length - failedBans.length}/${args.length} users! Successful Unbans: \`${successBans.join(", ")}\` `);
		}
		else if (args.length == 1 && successBans.length == 1){
			await m.edit(`<@${message.author.id}> :white_check_mark: Successfully unbanned ${successBans[0]}!`);
		}
		else if(args.length > 1 &&! successBans){
			await m.edit(`<@${message.author.id}> :no_entry: I was unable to unban any of the users you provided!`);
		}

		if (message.member.hasPermission("MANAGE_CHANNELS") &&! guildConfig.actionChannel){
        	const malert = await message.channel.send(":bulb: I can log this if you assign a action channel.").catch(e => {}) as Discord.Message;
        	malert.delete({timeout: 5000});
		}

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}