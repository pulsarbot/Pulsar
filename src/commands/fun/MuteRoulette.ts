//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, SnowflakeUtil } from "discord.js";
import fs from 'fs';

export default class MuteRoulette extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"muteroulette", //NAME
		"Mute a random user for 1 minute", //DESCRIPTION
		"muteroulette [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["muteroulette"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
		0, //MIN ARGS
		-1, //MAX ARGS
		["MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		10, //SPAM TIMEOUT
		["randommute", "rm", "mr"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(MuteRoulette.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length , message);
		
		//Check if the message type is direct
		if (message.channel.type === "dm") return message.author.send(":warning: This command may only be used on a server.");


		//message.delete().catch(e => {});

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
					deny: [
					'VIEW_CHANNEL',
					'ADD_REACTIONS',
					'SPEAK'
					]
				}]);
			});
		}

		const m = await message.channel.send(":hourglass: One moment, please... ") as Discord.Message;

		let selection: Discord.Collection<string, Discord.GuildMember> = await message.guild.members.cache.filter(m => !m.hasPermission(`MANAGE_MESSAGES`) &&! m.roles.cache.has(role.id) &&! m.user.bot);
		if(selection.array().length < 2 ||! selection ||! selection.random()) return m.edit(`:x: There aren't enough members in this guild to choose from!`)
		let randomMember = await selection.random()

    	// Give member the muted role
   		await randomMember.roles.add(role).catch(e => null);
    	await randomMember.voice.setMute(true, 'User Muted').catch(e => {});

		let psGuild = await bot.pulsarGuilds.get(message.guild.id);

		let muteTime = Date.now() + (1000 * 60);
		let caseID = SnowflakeUtil.generate();
		await psGuild.createMutedUserEntry(message.author.id, `default`, randomMember.id, muteTime , `Random Mute - MuteRoullete by ${message.author.tag}`, caseID);

		let guildConfig: any = psGuild.config

		// Try to report
    	if(guildConfig.actionChannel) {
        	let reportEmbed = new Discord.MessageEmbed()
        		.setAuthor("Mute", message.author.displayAvatarURL())
        		.setThumbnail(randomMember.user.displayAvatarURL())
    			.setColor("#ff7f00")
        		.addField("User", `<@${randomMember.user.id}> (${randomMember.user.tag})`)
				.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`)
				.addField(`Time`, `1 minute`)
				.addField(`Reason`, `Random Mute - MuteRoullete`)
        		.setTimestamp()
				.setFooter(`ID: ${caseID}`);
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

		try {
			await randomMember.user.send(`:mute: You have been muted on **${message.guild.name}** for 1 minute - Random Mute Command! Case ID: ${caseID}.`);
		}
		catch {
			null;
		}
		m.edit(`:white_check_mark: Randomly Muted - ${randomMember} (${randomMember.user.tag} [${randomMember.id}]) for 1 minute! Case ID: ${caseID}.`);
		
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}