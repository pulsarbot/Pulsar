//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, GuildMember } from "discord.js";
import fs from 'fs';

export default class Mute extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"mute", //NAME
		"Mute a user from speaking in the guild for a certain amount of time", //DESCRIPTION
		"mute [@member/userID] (time) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["mute [@severepain#0001] (60m) (spam)", "mute [@severepain#0001] (spam)"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		false, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["m", "silence", "deafen"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Mute.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length , message);
		
		//Check if the message type is direct
		if (message.channel.type === "dm") return message.author.send(":warning: This command may only be used on a server.");


		//message.delete().catch(e => {});


		const m = await message.channel.send(":hourglass: One moment, please... ") as Discord.Message;

		// No arguments
		if (!args[0]) return m.edit(`:information_source: The correct usage is: ${bot.config.prefix}${Mute.commandFields.usage}`);

		// Find Member
		var memberToMute: GuildMember;
		if(message.mentions.users.first()) memberToMute = await message.guild.members.cache.get(message.mentions.users.first().id);
		else memberToMute = await message.guild.members.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		await memberToMute
		// Member Not Found
		if (!memberToMute) return m.edit(`:warning: Couldn't find the member to mute.`);

		if(memberToMute.hasPermission(`MANAGE_MESSAGES`)) return m.edit(`:no_entry: You cannot mute that member!`);

		let role = message.guild.roles.cache.find(r => r.name === "Muted");
		// Create a new role if it doesn't exist already
		if(!role){
			role = await message.guild.roles.create({
				data: {
				name: "Muted",
				color: "#818386",
				permissions: []
			}
		});

			message.guild.channels.cache.forEach(async (channel, id) => {
				await channel.overwritePermissions([{
					id: role.id,
					deny: ['SEND_MESSAGES',
						'ADD_REACTIONS',
						'SPEAK']

				}]);
			});
		}

    	// User is already muted
    	if(memberToMute.roles.cache.has(role.id)) return m.edit(":warning: This person is already muted.");

    	// Give member the muted role
   		await memberToMute.roles.add(role).catch(e => {return m.edit(":warning: This member cannot be unmuted.");});;
    	await memberToMute.voice.setMute(true, 'User Muted').catch(e => {});

		let psGuild = await bot.pulsarGuilds.get(message.guild.id);
	
		let mutedUsersJSON = psGuild.muted_users

    	// Manage specifics of mute (time, reason)
    	let muteArgs = args.slice(1);
    	// Was a time provided? Handle it.
    	// Argument 0 represents a time, therefore the mute is temporary
    	if ((/^\d/.test(muteArgs[0])) && ((muteArgs[0].endsWith('s')) || (muteArgs[0].endsWith('m')) || (muteArgs[0].endsWith('h')) || (muteArgs[0].endsWith('d')) || (/\d+$/.test(muteArgs[0])))){
        	// Try calculating length of time
        	if (muteArgs[0].endsWith("s")) var timeToMute = 60000; // Seconds (assign a minimum mute time of one minute)
        	else if (muteArgs[0].endsWith("m")) var timeToMute = Number(muteArgs[0].substring(0, muteArgs[0].length - 1)) * 60000; // Minutes (with m provided)
        	else if (/\d+$/.test(muteArgs[0])) var timeToMute = Number(muteArgs[0]) * 60000; // Minutes (no m provided as this is the default)
        	else if (muteArgs[0].endsWith("h")) var timeToMute = Number(muteArgs[0].substring(0, muteArgs[0].length - 1)) * 3600000; // Hours
        	else if (muteArgs[0].endsWith("d")) var timeToMute = Number(muteArgs[0].substring(0, muteArgs[0].length - 1)) * 86400000; // Days
        	else throw "Time interpretation failed!"
        	// Ban Reason (if any)
			if(muteArgs[1]) var muteReason = muteArgs.slice(1).join(" ");
			else muteReason = null;
			
			// Save back to file
			let finalMuteTime = timeToMute + Date.now()
			let success = await psGuild.createMutedUserEntry(message.author.id, `default`, memberToMute.id, finalMuteTime, muteReason);

			await psGuild.refreshMutes();
			if(!success){
				console.log(`[ERROR] A method in the pulsarguild class has failed! createMutedUserEntry!`)
				return m.edit(":warning: There was an error with writing the file. Contact severepain about this.");
			} 
		}
    	else if (muteArgs) var muteReason = muteArgs.join(" ");

		if(!timeToMute){
			let rr = muteReason || null;
			psGuild.muted_users[memberToMute.id] =  {
				"reason": rr,
				"caseID": Discord.SnowflakeUtil.generate(Date.now()),
				"moderatorID": message.author.id,
				"userID": memberToMute.id,
				"type": "mute"
			};

			fs.writeFileSync(`./data/guilds/${message.guild.id}/muted-users.json`, JSON.stringify(psGuild.muted_users, null, 4));
		}
		
   		// Try to notify the member that they have been muted
		if(muteReason && timeToMute) memberToMute.user.send(`:mute: You have been muted on **${message.guild.name}** for ${String(timeToMute/60000)} minutes for the following reason: ${muteReason}. Your case ID is ${psGuild.muted_users[memberToMute.id].caseID}`).catch(e => {})
    	else if (muteReason) memberToMute.user.send(`:mute: You have been muted on **${message.guild.name}** for the following reason: ${muteReason}. Your case ID is ${psGuild.muted_users[memberToMute.id].caseID}`).catch(e => {})
    	else if (timeToMute) memberToMute.user.send(`:mute: You have been muted on **${message.guild.name}** for ${String(timeToMute/60000)} minutes. Your case ID is ${psGuild.muted_users[memberToMute.id].caseID}`).catch(e => {})
    	else memberToMute.user.send(`:mute: You have been muted on **${message.guild.name}**. Your case ID is ${psGuild.muted_users[memberToMute.id].caseID}`).catch(e => {});


    	timeToMute ? m.edit(`:white_check_mark: <@${memberToMute.id}> (${memberToMute.user.tag}) has been muted for ${String(timeToMute/60000)} minutes. Case ID: ${psGuild.muted_users[memberToMute.id].caseID}`) : m.edit(`:white_check_mark: <@${memberToMute.id}> (${memberToMute.user.tag}) has been muted. Case ID: ${psGuild.muted_users[memberToMute.id].caseID}`);

		let guildConfig: any = psGuild.config

		// Try to report
    	if(guildConfig.actionChannel) {
        	let reportEmbed = new Discord.MessageEmbed()
        		.setAuthor("Mute", message.author.displayAvatarURL())
        		.setThumbnail(memberToMute.user.displayAvatarURL())
    			.setColor("#ff7f00")
        		.addField("User", `<@${memberToMute.user.id}> (${memberToMute.user.tag})`)
        		.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
        		.setTimestamp()
        		.setFooter(`ID: ${psGuild.muted_users[memberToMute.id].caseID}`);
    		if (timeToMute) reportEmbed.addField("Time", `${String(timeToMute/60000)} minutes`);
        	if (muteReason) reportEmbed.addField("Reason", muteReason);
			let reportChannelTemp = bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;
			await reportChannelTemp.send(reportEmbed)
        	.catch(async error => {
        		const malert = await message.channel.send(":warning: Couldn't log the incident. The action channel may have been deleted, or I no longer have permission to access the channel.").catch(e => {}) as Discord.Message;
        		malert.delete({timeout: 5000});
        	});
		} 
		else if (message.member.hasPermission("MANAGE_CHANNELS")){
        	const malert = await message.channel.send(":bulb: I can log this if you assign a action channel.").catch(e => {}) as Discord.Message;
        	malert.delete({timeout: 5000});
		}
		
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}