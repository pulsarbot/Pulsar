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
import axios from 'axios';

// I yoinked the idea for this command from Kaimund600 lmfao

export default class MoveAll extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"moveall", //NAME
		"Moves all the users from a voice channel you are in into a target voice channel ID!", //DESCRIPTION
		"moveall [targetID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["moveall [585572136895250481]"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		1, //MAX ARGS
		["MOVE_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		5000, //SPAM TIMEOUT
		["switchchannel", "movevc"] //ALIASES
	);


	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(MoveAll.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);
		
		if(!message.member.voice.channel){
			return message.reply(`:no_entry: You must be in a voice channel to use this command!`)
		}

		let originalChannel = message.member.voice.channel;

		let channelToMoveTo = await message.guild.channels.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		if(!channelToMoveTo){
			return message.reply(`:no_entry: The value you provided was not a valid channel ID or I could not access that channel!`);
		}

		if(channelToMoveTo.type !== "voice"){
			return message.reply(`:no_entry: The destination channel must be a voice channel!`);
		}

		let self = await message.guild.members.cache.get(bot.user.id);

		if(!self.hasPermission("MOVE_MEMBERS")){
			return message.reply(`:warning: I do not have permission to move members!`);
		}


		originalChannel.members.forEach(member => {
			try {
				member.voice.setChannel(channelToMoveTo);
			}
			catch {
				null;
			}
		})

		message.channel.send(`:white_check_mark: Moved all users from ${originalChannel.name} to ${channelToMoveTo.name}!`);

	}
}