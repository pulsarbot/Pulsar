//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

import MathUtil from '../../util/MathUtil';

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild } from "discord.js";
import fs from 'fs';

export default class Case extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"case", //NAME
		"Gets a case via case ID for a punishment", //DESCRIPTION
		"case [caseID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["case 13267567124", "case 31794871941"], //EXAMPLES
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
		["caseID", "getcase", "punishmentID"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Case.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		function capitalize_Words(str: string): string{
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});	
			}

		if(!message.guild) return message.reply(`:warning: This command can only be used in a guild!`);
		let psGuild = await bot.pulsarGuilds.get(message.guild.id);

		let punishmentCase = await psGuild.getCase(args[0]) || null;
		if(!punishmentCase) return message.reply(`:no_entry: Invalid case ID! The user's punishment has probably expired!`);

		let messageToSend = `:information_source: Case ID: {caseID} [STATUS: {caseStatus}]\n\`\`\`User: {userTAG} [{userID}]\nPunishment: {punishmentTYPE}\nModerator: {modTAG} [{modID}]\nReason: {reason}\nIssued On: {dateIssuedOn}\nTime remaining: {timeRemaining}\`\`\``;

		let date_ob = Discord.SnowflakeUtil.deconstruct(args[0].toLowerCase()).date;
		let moderator = await bot.users.cache.get(punishmentCase.object.moderatorID) || null; 

		let punishedUser = await bot.users.cache.get(punishmentCase.userID);
		let finalMSG
		let reason = punishmentCase.object.reason || "No Reason Provided";
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

		let timeOnExpire = punishmentCase.object.time;
		let timeRemaining;
		if(!timeOnExpire) timeRemaining = null;
		else timeRemaining = await MathUtil.msToDHMS(punishmentCase.object.time - Date.now());

		if(moderator){
			finalMSG = await messageToSend.replace(`{caseID}`, `${args[0]}`).replace(`{userTAG}`, `${punishedUser.tag}`).replace(`{userID}`, `${punishedUser.id}`).replace(`{punishmentTYPE}`, `${capitalize_Words(punishmentCase.caseType)}`).replace(`{modTAG}`, `${moderator.tag}`).replace(`{modID}`, moderator.id).replace(`{dateIssuedOn}`, `${month}/${day}/${year} at ${hours}:${minutes} ${timeOfDay} [Time Offset: +${date_ob.getTimezoneOffset() / 60}]`)
		}
		else {
			finalMSG = await messageToSend.replace(`{caseID}`, `${args[0]}`).replace(`{userTAG}`, `${punishedUser.tag}`).replace(`{userID}`, `${punishedUser.id}`).replace(`{punishmentTYPE}`, `${capitalize_Words(punishmentCase.caseType)}`).replace(`{modTAG}`, `Couldn\'t find the moderator`).replace(`[{modID}]`, ``).replace(`{dateIssuedOn}`, `${month}/${day}/${year} at ${hours}:${minutes} ${timeOfDay} [Time Offset: +${date_ob.getTimezoneOffset() / 60}]`)
		}

		if(timeRemaining && punishmentCase.object.status.includes(`Still Punished`)){
			finalMSG = await finalMSG.replace(`{timeRemaining}`, `${timeRemaining.day} day(s), ${timeRemaining.hours} hour(s), ${timeRemaining.minutes} minute(s), and ${timeRemaining.seconds} second(s)`);
		}
		else if(!timeRemaining && punishmentCase.object.status.includes(`Still Punished`)){
			finalMSG = await finalMSG.replace(`{timeRemaining}`, `Infinite`);
		}
		else if(!punishmentCase.object.status.includes(`Still Punished`)){
			finalMSG = await finalMSG.replace(`{timeRemaining}`, `Case Resolved!`);
		}

		finalMSG = await finalMSG.replace(`{caseStatus}`, punishmentCase.object.status);

		if(reason) finalMSG = await finalMSG.replace(`{reason}`, reason);
		else finalMSG = await finalMSG.replace(`{reason}`, `No Reason Provided`);

		return message.channel.send(finalMSG);
}

}
