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

export default class MoveHere extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"movehere", //NAME
		"Moves a user from a voice channel into the voice channel you are inside.", //DESCRIPTION
		"moveahere [@user/userID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["movehere [362938646304653312]"], //EXAMPLES
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
		[] //ALIASES
	);


	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(MoveHere.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);
		
		if(!message.member.voice.channel){
			return message.reply(`:no_entry: You must be in a voice channel to use this command!`)
		}

		let originalChannel = message.member.voice.channel;

		let userToMoveHere = await message.guild.members.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		if(!userToMoveHere){
			return message.reply(`:no_entry: The user you provided was invalid!`);
		}
		if(!userToMoveHere.voice.channel){
			return message.reply(`:no_entry: That user is not inside a voice channel!`);
		}

		let self = await message.guild.members.cache.get(bot.user.id);

		if(!self.hasPermission("MOVE_MEMBERS")){
			return message.reply(`:warning: I do not have permission to move members!`);
		}

		await userToMoveHere.voice.setChannel(originalChannel);
		
		message.channel.send(`:white_check_mark: Moved all user ${userToMoveHere.user.tag} from ${userToMoveHere.voice.channel.name} to ${originalChannel.name}!`);

	}
}