//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { GuildMember, MessageEmbed, TextChannel, Message, VoiceChannel } from "discord.js";
import PulsarGuild from "../../handlers/PulsarGuild";
import fs, { WriteStream } from 'fs';
import axios from 'axios';

// I yoinked the idea for this command from Kaimund600 lmfao

export default class DisconnectAll extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"disconnectall", //NAME
		"Disconnects all the users from a voice channel you are in!", //DESCRIPTION
		"disconnectall [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["disconnectall"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		0, //MIN ARGS
		0, //MAX ARGS
		["MOVE_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		5000, //SPAM TIMEOUT
		["leaveall", "disconnect"] //ALIASES
	);


	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(DisconnectAll.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);
		
		if(!message.member.voice.channel){
			return message.reply(`:no_entry: You must be in a voice channel to use this command!`)
		}

		let originalChannel = message.member.voice.channel;

		let self = await message.guild.members.cache.get(bot.user.id);

		if(!self.hasPermission("MOVE_MEMBERS")){
			return message.reply(`:warning: I do not have permission to disconnect members!`);
		}


		originalChannel.members.forEach(member => {
			try {
				member.voice.setChannel(null);
			}
			catch {
				null;
			}
		})

		message.channel.send(`:white_check_mark: Disconnected all users from ${originalChannel.name}!`);

	}
}