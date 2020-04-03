//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { GuildMember, MessageEmbed, TextChannel, Message, SnowflakeUtil } from "discord.js";
import PulsarGuild from "../../handlers/PulsarGuild";

import fs from 'fs';

export default class Kick extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"kick", //NAME
		"Kick a user from the guild", //DESCRIPTION
		"kick [@user/userID] (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["kick [@severepain#0001] (being an idiot)"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["KICK_MEMBERS", "MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["k", "boot"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "EightBall"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Kick.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		// Attempt to get the GuildMember
		var memberToKick: GuildMember;
		if(message.mentions.users.first()) memberToKick = await message.guild.members.cache.get(message.mentions.users.first().id);
		else memberToKick = await message.guild.members.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		if(!memberToKick){
			message.reply(`:warning: Couldn't find the member to kick.`)
			return;
		}

		if(memberToKick.hasPermission(`MANAGE_MESSAGES`)) return message.reply(`:no_entry: You cannot kick that member!`);

		if(!memberToKick.kickable){
			return message.reply(`:warning: I cannot kick that member!`);
		}

		let kickReason: string = null;

		if(args[1]){
			kickReason = args.join(" ").replace(`${args[0]} `, ``);
			memberToKick.kick(kickReason);
		}
		else {
			memberToKick.kick(`No Reason Provided`);
		}

		let psGuild: PulsarGuild = await bot.pulsarGuilds.get(message.guild.id);
		let guildConfig: any = psGuild.config;

		let punishmentHistory = psGuild.punishment_history;
		let caseID = SnowflakeUtil.generate();
		let obj = {
			"time": null,
			"reason": kickReason,
			"caseID": caseID,
			"moderatorID": message.author.id,
			"type": "kick",
			"userID": memberToKick.id,
			"status": "**Punishment Carried Out!**"
		}
		
		punishmentHistory[caseID] = obj;
		await fs.writeFileSync(`./data/guilds/${message.guild.id}/punishment-history.json`, JSON.stringify(punishmentHistory, null, 4));


		// Create the report embed
		let reportEmbed = new MessageEmbed()
		.setAuthor("Kick", message.author.displayAvatarURL())
		.setThumbnail(memberToKick.user.displayAvatarURL())
		.setColor("#ff7f00")
		.addField("User", `<@${memberToKick.user.id}> (${memberToKick.user.tag})`)
		.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
		.setTimestamp()
		.setFooter(`ID: ${memberToKick.user.id}`);

		if(kickReason){
			reportEmbed.addField("Reason", kickReason);
		}
		else {
			reportEmbed.addField("Reason", "No Reason Provided");
		}

		// Respond with a success message
		await message.reply(`:white_check_mark: <@${memberToKick.id}> (${memberToKick.user.tag}) has been kicked.`)

		// Attempt to log the incident
		if(guildConfig.actionChannel){
			let actionChannel = await bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;
			actionChannel.send(reportEmbed);
		}
		else {
			let infoMessage = await message.channel.send(`:bulb: I can log this if you assign a action channel.`) as Message;
			infoMessage.delete({timeout: 5000});
		}

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}