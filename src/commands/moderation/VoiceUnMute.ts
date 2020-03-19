//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, GuildMember } from "discord.js";
import fs from 'fs';

export default class VoiceUnMute extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"vunmute", //NAME
		"unmute a voice muted user from a guild", //DESCRIPTION
		"vunmute [@member/userID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["vunmute [@severepain#0001]"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["MANAGE_MESSAGES", "MUTE_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		false, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["vum", "unvmute", "speakperms"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(VoiceUnMute.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length , message);
		
		//Check if the message type is direct
		if (message.channel.type === "dm") return message.author.send(":warning: This command may only be used on a server.");

		//message.delete().catch(e => {});

		const m = await message.channel.send(":hourglass: One moment, please... ") as Discord.Message;

		// No arguments
		if (!args[0]) return m.edit(`:information_source: The correct usage is: ${bot.config.prefix}${VoiceUnMute.commandFields.usage}`);

		// Find Member
		var memberToMute: GuildMember;
		if(message.mentions.users.first()) memberToMute = await message.guild.members.cache.get(message.mentions.users.first().id);
		else memberToMute = await message.guild.members.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		await memberToMute
		// Member Not Found
		if (!memberToMute) return m.edit(`:warning: Couldn't find the member to un-voice mute.`);

		let muteRole = message.guild.roles.cache.find(r => r.name === "Voice Muted");
		if(!muteRole) return m.edit(`:warning: The voice muted role doesn't exist on this server!`);

		let psGuild = await bot.pulsarGuilds.get(message.guild.id);

		let guildConfig: any = psGuild.config;
		let isUserMuted = await psGuild.isUserMuted(`voice`, memberToMute.id);

		if(!memberToMute.roles.cache.has(muteRole.id) && isUserMuted){
			let unmuteSuccessful = await psGuild.deleteMutedUserEntry(`voice`, memberToMute.id)
			if(!unmuteSuccessful){
				return m.edit(`:no_entry: An error has occured! Please contact severepain!`);
			}
			return m.edit(`:white_check_mark: Removed that person from the timed mutes list!`);
		}
		else if (!memberToMute.roles.cache.has(muteRole.id) &&! isUserMuted){
			return m.edit(`:no_entry: That person is not voice muted!`);
		}

		let reportEmbed = new Discord.MessageEmbed()
			.setAuthor("Voice Unmute", message.author.displayAvatarURL())
			.setThumbnail(memberToMute.user.displayAvatarURL())
			.setColor("#00ff7f")
			.addField("User", `<@${memberToMute.user.id}> (${memberToMute.user.tag})`)
			.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
			.setTimestamp()
			.setFooter(`ID: ${memberToMute.user.id}`)

		if(!isUserMuted && memberToMute.roles.cache.has(muteRole.id)){
			memberToMute.roles.remove(muteRole.id)
			if(guildConfig.actionChannel){
			let toSendChannel = bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;
			toSendChannel.send(reportEmbed)
			}
			await memberToMute.user.send(`:microphone2: You have regained your speaking perms on ${message.guild.name}!`)
			return m.edit(`:white_check_mark: User <@${memberToMute.id}> (${memberToMute.user.tag}) has regained their speaking perms!`)
		}
		else if (isUserMuted){
			try{
				let unmuteSuccessful = await psGuild.deleteMutedUserEntry(`voice`, memberToMute.id)
				if(!unmuteSuccessful){
					return m.edit(`:no_entry: An error has occured! Please contact severepain!`);
				}
				if(guildConfig.actionChannel) {
					let toSendChannel = bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;
					await toSendChannel.send(reportEmbed)
					.catch(async error => {
						let malert = await message.channel.send(":warning: Couldn't log the incident. The action channel may have been deleted, or I no longer have permission to access the channel.").catch(e => {}) as Discord.Message;
						malert.delete({timeout: 5000});
					});
				} else if(message.member.hasPermission("MANAGE_CHANNELS")){
					let malert = await message.channel.send(":bulb: I can log this if you assign a action channel.").catch(e => {}) as Discord.Message;
					malert.delete({timeout: 5000});
				}
				await memberToMute.user.send(`:microphone2: You have regained your speaking perms on ${message.guild.name}!`)
				return m.edit(`:white_check_mark: User <@${memberToMute.id}> (${memberToMute.user.tag}) has regained their speaking perms!`)
			}
			catch (error) {
				console.log(error);
				return m.edit(`:no_entry: An error has occured! Please contact severepain!`);
			}
		}
		
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}