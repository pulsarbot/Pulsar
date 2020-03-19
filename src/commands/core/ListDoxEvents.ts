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

export default class ListDoxEvents extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"listdoxevents", //NAME
		"Lists the latest dox events", //DESCRIPTION
		"listdoxevents (offender ID)", //USAGE - [] = MANDATORY () = OPTIONAL
		["listdoxevents (2738561891120)"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		0, //MIN ARGS
		1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["listrecentdoxes", "listdoxes", "recentdoxevents"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Command"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(ListDoxEvents.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Assert the argument count
		super.assertArgCount(args.length, message);

		if(!bot.config.antiDoxEnabled) return message.reply(`:x: The anti-dox modules are disabled!`);
		let doxEvents = await JSON.parse(fs.readFileSync('./data/doxEvents.json').toString()); // This is an array of objects

		if(!doxEvents || doxEvents.length < 1){
			return message.reply(`:x: There are no dox events to log!`)
		}

		let listFromUser = false;
		let userToListFrom = null;
		if(args[0] && bot.users.cache.has(args[0].replace(/[^\w\s]/gi, ''))){
			listFromUser = true;
			userToListFrom = await bot.users.cache.get(args[0].replace(/[^\w\s]/gi, ''));
		}
		if(userToListFrom){
			let doxEventsFromUser = await doxEvents.filter(obj => obj.userID == userToListFrom.id);
			if(doxEventsFromUser.length >= 1){
				let time = Math.floor(Date.now() - parseInt(doxEventsFromUser[doxEventsFromUser.length - 1].time));
				let timeInBetween = Math.floor((time/1000)/60);
				return message.reply(`:white_check_mark: User ${userToListFrom.tag} (${userToListFrom.id}) has doxed ${doxEventsFromUser.length} time(s)! *(Last dox event was ${timeInBetween} Minutes Ago)*`)
			}
			else {
				return message.reply(`:x: That user has not doxed!`)
			}

		}
		else {
			let usersWhoRecentlyDoxed: string[] = []; 
			let i = 0
			await AsyncForEachModule.asyncForEach(doxEvents, object => {
				if(i > 5) return;

				let time = Math.floor(Date.now() - parseInt(object.time));
				let timeInBetween = Math.floor((time/1000)/60);
				usersWhoRecentlyDoxed.push(`${object.userTag} [${object.userID}] in guild ${object.guildInfo} [${timeInBetween} Minutes Ago]`)
				i++
			})

			return message.reply(`:white_check_mark: Recent dox events: \n\`${usersWhoRecentlyDoxed.join(`\n`)}\` `)
		}

		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}