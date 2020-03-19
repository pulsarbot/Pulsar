//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

// This is the announce command for announcing Buddhism Hotline going live in the OBH discord server
export default class Announce extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"announce", //NAME
		"Announces to the #announcements channel of OBH", //DESCRIPTION
		"announce [switch] (custom message)", //USAGE - [] = MANDATORY () = OPTIONAL
		["announce [1]", "announce [2] [Custom Announcement]"], //EXAMPLES
		CommandCategory.CUSTOM, //CATEGORY
		0, //MIN ARGS
		-1, //MAX ARGS
		["BAN_MEMBERS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		["451248270409334796", "544276344792678410"], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		120000, //SPAM TIMEOUT
		["announcebh", "buddhismhotline", "an"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Announce.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		let failString = `:information_source: The correct usage is: \`\`\`\n${bot.config.prefix}announce 1 - Ping everybody and announce buddhism hotline is live\n${bot.config.prefix}announce 2 [custom message] - Annonunce a custom message\`\`\` `;

		// If there is no case/switch entered, list all of the different cases
		if(!args[0]){
			message.reply(failString);
			return;
		}
		if(!parseInt(args[0])){
			message.reply(failString);
			return;
		}

		let announceChannel = await bot.channels.cache.get(`451364054125248514`) as TextChannel;

		switch(args[0]){
			case "1": 
				await announceChannel.send(`@everyone The Buddhism Hotline is now live! https://www.youtube.com/channel/UCrB8o1tlLKRnPHlpSy3GBFg/live`);
				break;
			case "2":
				let newArgs = args.join(" ").replace(`${args[0]} `, ``);
				if(!newArgs) return message.reply(failString);
				await announceChannel.send(newArgs);
				break;
		}

		// Resolve the promise/return
		return Promise.resolve(true);

}

}
