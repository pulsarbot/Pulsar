//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

import MathUtil from '../../util/MathUtil';
import AsyncUtil from '../../util/AsyncUtil';

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

export default class Cases extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"cases", //NAME
		"Gets all of the cases for a user", //DESCRIPTION
		"cases [@user/userID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["cases 13267567124", "cases 31794871941"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		1, //MAX ARGS
		["MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		1000, //SPAM TIMEOUT
		["punishments", "getcases", "punishmenthistory", "offenses"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Cases.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

		function capitalize_Words(str: string): string{
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});	
		}

		//Assert the argument count	
		super.assertArgCount(args.length , message);

		if(!message.guild) return message.reply(`:warning: This command can only be used in a guild!`);
		let psGuild = await bot.pulsarGuilds.get(message.guild.id);

		// Find Member
		var userToGetCases: Discord.User;
		if(message.mentions.users.first()) userToGetCases = await bot.users.cache.get(message.mentions.users.first().id);
		else userToGetCases = await  bot.users.cache.get(args[0].replace(/[^\w\s]/gi, ''));

		// Member Not Found
		if (!userToGetCases) return message.reply(`:warning: Couldn't find the member to get cases for!`);

		let casesArr: object[] = [];
		for (let i in psGuild.punishment_history){
			if(psGuild.punishment_history[i].userID == userToGetCases.id) casesArr.push(psGuild.punishment_history[i]);
			else continue
		}

		if(!casesArr || casesArr.length < 1) return message.reply(`:no_entry: That user hasn't ever been punished in this guild with this bot!`);

		let formattedEntries: string[] = [];
		let i: number = casesArr.length + 1;

		await AsyncUtil.asyncForEach(casesArr, async entry => {
		let date_ob = Discord.SnowflakeUtil.deconstruct(entry.caseID).date;
		// current month
		let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

		// current year
		let year = date_ob.getFullYear();

		// current day
		let day = date_ob.getDate();

		let timeOfDay = "AM"
		// current hours
		let hours = date_ob.getHours();
		if(hours > 12){
			hours = hours - 12;
			timeOfDay = "PM";
		}
		// current minutes
		let minutes = date_ob.getMinutes();

		// current seconds
		let seconds = date_ob.getSeconds();

		let timeOnExpire = entry.time;
		let timeRemaining;
		if(!timeOnExpire || timeOnExpire < Date.now()) timeRemaining = null;
		else timeRemaining = await MathUtil.msToDHMS(entry.time - Date.now());

		let modtag = (await bot.fetchUser(entry.moderatorID)).tag || `Couldn't find moderator tag`;

			formattedEntries.push(`${i - 1}: Case ID: ${entry.caseID} | ${capitalize_Words(entry.type)} - ${month}/${day}/${year} at ${hours}:${minutes} ${timeOfDay} [Moderator: ${modtag}] - Status: ${entry.status.replace(/[*]/g, ``)}`);
			i--;
		})

		if(formattedEntries.length > 10){
			let i = 0;
			formattedEntries = formattedEntries.slice(Math.max(formattedEntries.length - 10, 0)); // Last 10 entries
		}
		else {
			formattedEntries = formattedEntries
		}
		
		formattedEntries = formattedEntries.reverse()

		return message.channel.send(`:information_source: Punishment history of ${userToGetCases.tag} [${userToGetCases.id}] (Last 10 Cases)\n\`\`\`${formattedEntries.join(`\n`)}\`\`\``)
}

}
