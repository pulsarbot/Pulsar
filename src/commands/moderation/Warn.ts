//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { GuildMember, MessageEmbed, TextChannel, Message, SnowflakeUtil } from "discord.js";
import fs from 'fs';

export default class Warn extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"warn", //NAME
		"Sends a warning to a user", //DESCRIPTION
		"warn [@user/userID] [warning message]", //USAGE - [] = MANDATORY () = OPTIONAL
		["warn [@severepain#0001] [stop spamming]"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		2, //MIN ARGS
		-1, //MAX ARGS
		["MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["sendwarning"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Warn.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		// Find Member
		var memberToWarn: GuildMember;
		if(message.mentions.users.first()) memberToWarn = await message.guild.members.cache.get(message.mentions.users.first().id);
		else memberToWarn = await message.guild.members.cache.get(args[0]);

		// Member Not Found
		if (!memberToWarn) return message.reply(`:warning: Couldn't find the member to warn.`);
    	// Warn Reason
    	let warnReason = args.slice(1).join(" ");
    	// None Provided
    	if(!warnReason) return message.reply(`:warning: You didn't specify a warn reason.`);
		if(bot.config.botAdmins.includes(memberToWarn.id) || memberToWarn.hasPermission("MANAGE_MESSAGES")) return message.reply(":x: You cannot warn that member")

		let pulsarGuild = await bot.pulsarGuilds.get(message.guild.id);
		let guildConfig: any = pulsarGuild.config;

		let punishmentHistory = pulsarGuild.punishment_history;
		let caseID = SnowflakeUtil.generate();
		let obj = {
			"time": null,
			"reason": warnReason,
			"caseID": caseID,
			"moderatorID": message.author.id,
			"type": "warn",
			"userID": memberToWarn.id,
			"status": "**Punishment Carried Out!**"
		}
		
		punishmentHistory[caseID] = obj;
		await fs.writeFileSync(`./data/guilds/${message.guild.id}/punishment-history.json`, JSON.stringify(punishmentHistory, null, 4));

		try{
			await memberToWarn.user.send(`:warning: You were warned on **${message.guild.name}** for the following reason: ${warnReason}. Case ID: ${caseID}`);
			message.channel.send(`:white_check_mark: <@${memberToWarn.id}> (${memberToWarn.user.tag}) has been warned. Case ID: ${caseID}`);
		} catch(error) {
			// Was the error caused by messages being blocked? Notify the user to change their privacy settings.
			if(error == "DiscordAPIError: Cannot send messages to this user"){
				guildConfig.actionChannel ? message.channel.send(":warning: Unable to contact the target member. This incident will be logged.") : message.channel.send(":warning: Unable to contact the target member.");
			} else throw error;
		}
		
		// Try logging the incident
			if(guildConfig.actionChannel){
				let reportEmbed = new Discord.MessageEmbed()
				.setAuthor("Warn", message.author.displayAvatarURL())
				.setThumbnail(memberToWarn.user.displayAvatarURL())
				.setColor("#ffeb00")
				.addField("User", `<@${memberToWarn.user.id}> (${memberToWarn.user.tag})`)
				.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
				.addField("Reason", warnReason)
				.setTimestamp()
				.setFooter(`ID: ${memberToWarn.user.id}`);
				(<TextChannel> bot.channels.cache.get(guildConfig.actionChannel)).send(reportEmbed)
				.catch(async error => {
					const malert = await message.channel.send(":warning: Couldn't log the incident. The logging channel may have been deleted, or I no longer have permission to access the channel.").catch(e => {}) as Message;
					malert.delete({timeout: 5000});
				});
			} else if (message.member.hasPermission("MANAGE_CHANNELS")){
				const malert = await message.channel.send(":bulb: I can log this if you assign a logging channel.").catch(e => {}) as Message;
				malert.delete({timeout: 5000});
			}

			return Promise.resolve(true);

	}
}