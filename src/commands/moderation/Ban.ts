//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message } from "discord.js";
import fs from 'fs';

export default class Ban extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"ban", //NAME
		"Ban a user from a guild", //DESCRIPTION
		"ban [@member/userID] (time) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["ban [@severepain#0001] (60m) (spam)", "ban [@severepain#0001] (spam)"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["BAN_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		false, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["banmember", "hackban", "b", "banuser"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Ban.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		//Check if the message type is direct
		if (message.channel.type === "dm") return message.author.send(":warning: This command may only be used on a server.");
		
		//Send the info message
		const m = await message.channel.send(":hourglass: One moment, please... ") as Discord.Message;

		// No arguments
		if (!args[0]) return m.edit(`:information_source: The correct usage is: ${bot.config.prefix}${Ban.commandFields.usage}`);

		// Find User
		var userToBan: Discord.User;
		let userToBanMember = message.guild.members.cache.find(member => member === message.mentions.members.first()) || null;
		if (userToBanMember) userToBan = userToBanMember.user;
		if (!userToBan) userToBan = await bot.fetchUser(args[0]); // If the user is not in the guild, ban them by their ID

		// There is no user to ban
		if(!userToBan) return m.edit(`:no_entry: Couldn't find the member to ban.`);
		// Bot has no permission
		if(!message.member.guild.me.hasPermission("BAN_MEMBERS")) return m.edit(":no_entry: I do not have permission to ban members.");

		if(bot.config.botAdmins.includes(userToBan.id)) return m.edit(":x: You cannot ban that user!")

        // Target member not bannable by system
		if(!userToBan ||! userToBanMember.bannable) return m.edit(":no_entry: I cannot ban this user!");
		
		let psGuild = await bot.pulsarGuilds.get(message.guild.id);

		let guildConfig: any = psGuild.config;
		var bannedUsersJSON = psGuild.temp_banned_users;

		// Manage specifics of ban (time, reason)
		let banArgs = args.slice(1);
		// Was a time provided? Handle it.
		// Argument 0 represents a time, therefore the ban is temporary
		if ((/^\d/.test(banArgs[0])) && ((banArgs[0].endsWith('s')) || (banArgs[0].endsWith('m')) || (banArgs[0].endsWith('h')) || (banArgs[0].endsWith('d')) || (/\d+$/.test(banArgs[0])))){
			// Try calculating length of time
			if (banArgs[0].endsWith("s")) var timeToBan = 60000; // Seconds (assign a minimum ban time of one minute)
			else if (banArgs[0].endsWith("m")) var timeToBan = Number(banArgs[0].substring(0, banArgs[0].length - 1)) * 60000; // Minutes (with m provided)
			else if (/\d+$/.test(banArgs[0])) var timeToBan = Number(banArgs[0]) * 60000; // Minutes (no m provided as this is the default)
			else if (banArgs[0].endsWith("h")) var timeToBan = Number(banArgs[0].substring(0, banArgs[0].length - 1)) * 3600000; // Hours
			else if (banArgs[0].endsWith("d")) var timeToBan = Number(banArgs[0].substring(0, banArgs[0].length - 1)) * 86400000; // Days
			else return m.edit(":warning: Couldn't understand the provided time. Valid examples include: 10m, 3h, 2d.");
			// Ban Reason (if any)
			let banReason
			if(banArgs[1]) banReason = banArgs.slice(1).join(" ");
			if(!banReason) banReason = null;
			// Create JSON object
			let isSuccess = psGuild.createTempBannedUserEntry(message.author.id, userToBan.id, userToBan.tag, userToBan.avatarURL(), Date.now() + timeToBan, banReason);
			if(!isSuccess){
				return m.edit(`:no_entry: Something went wrong writing to the file! Contact severepain about this issue!`);
			}
	
		} else if (banArgs) var banReason = banArgs.join(" "); // Ban Reason (if any)

		    // Try to notify the member that they have been banned (only if they're already in the server)
			if (userToBan) {
				if(!timeToBan){
					let rr = banReason || null;
					psGuild.temp_banned_users[userToBan.id] =  {
						"reason": rr,
						"caseID": Discord.SnowflakeUtil.generate(Date.now()),
						"moderatorID": message.author.id,
						"type": "ban",
						"userID": userToBan.id
					};
		
					fs.writeFileSync(`./data/guilds/${message.guild.id}/banned-users.json`, JSON.stringify(psGuild.temp_banned_users, null, 4));
				}

				if (banReason && timeToBan) await userToBan.send(`:no_entry: You have been banned from **${message.guild.name}** for ${String(timeToBan/60000)} minutes for the following reason: ${banReason}. Your case ID is ${psGuild.temp_banned_users[userToBan.id].caseID}`).catch(e => {})
				else if (banReason) await userToBan.send(`:no_entry: You have been banned from **${message.guild.name}** for the following reason: ${banReason}. Your case ID is ${psGuild.temp_banned_users[userToBan.id].caseID}`).catch(e => {})
				else if (timeToBan) await userToBan.send(`:no_entry: You have been banned from **${message.guild.name}** for ${String(timeToBan/60000)} minutes. Your case ID is ${psGuild.temp_banned_users[userToBan.id].caseID}`).catch(e => {})
				else await userToBan.send(`:no_entry: You have been banned from **${message.guild.name}**. Your case ID is ${psGuild.temp_banned_users[userToBan.id].caseID}`).catch(e => {});
			}
		
			// Actually ban the member
			if (banReason) {
				message.guild.members.ban(userToBan, {reason: banReason, days: 1});
			} else {
				message.guild.members.ban(userToBan, {days: 1});
			}

			timeToBan ? m.edit(`:white_check_mark: <@${userToBan.id}> (${userToBan.tag}) has been banned for ${String(timeToBan/60000)} minutes. Case ID: ${psGuild.temp_banned_users[userToBan.id].caseID}`) : m.edit(`:white_check_mark: <@${userToBan.id}> (${userToBan.tag}) has been banned. Case ID: ${psGuild.temp_banned_users[userToBan.id].caseID}`);
			
			// Try to report
			if (guildConfig.actionChannel) {
				try{
					let reportEmbed = new Discord.MessageEmbed()
					.setAuthor("Ban", message.author.displayAvatarURL())
					.setThumbnail(userToBan.displayAvatarURL())
					.setColor("#800000")
					.addField("User", `<@${userToBan.id}> (${userToBan.tag})`)
					.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
					.setTimestamp()
					.setFooter(`ID: ${psGuild.temp_banned_users[userToBan.id].caseID}`);
					if (timeToBan) reportEmbed.addField("Time", `${String(timeToBan/60000)} minutes`);
					if (banReason) reportEmbed.addField("Reason", banReason);
					(<Discord.TextChannel> guildConfig.actionChannel).send(reportEmbed);
				} catch {
					const malert = await message.channel.send(":warning: Couldn't log the incident. The action channel may have been deleted, or I no longer have permission to access the channel.") as Discord.Message;
					malert.delete({timeout: 5000});
				}
			} else if (message.member.hasPermission("MANAGE_CHANNELS")){
				const malert = await message.channel.send(":bulb: I can log this if you assign a action channel.") as Discord.Message;
				malert.delete({timeout: 5000});
			}

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}