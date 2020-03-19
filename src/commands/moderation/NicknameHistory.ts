//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Collection, GuildMember } from "discord.js";
import fs from 'fs';
import { parse } from "querystring";
import AsyncForEachModule from '../../util/AsyncUtil';


import * as antiDoxScreen from '../../modules/Antidox/antiDoxScreen';

export default class NicknameHistory extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"nicknamehistory", //NAME
		"Shows a users nickname history", //DESCRIPTION
		"nicknamehistory [@member/userID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["nicknamehistory [@severepain#0001]"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		1, //MAX ARGS
		["MANAGE_NICKNAMES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		5000, //SPAM TIMEOUT
		["names", "nicks", "nh", "nicknames"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(NicknameHistory.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
			//Assert the argument count
			super.assertArgCount(args.length, message);

			
			//Check if the message type is direct
			if (message.channel.type !== "text") return message.author.send(":warning: This command may only be used on a server.");

			let botMember = await message.guild.members.cache.get(bot.user.id);
			
			if(!botMember.hasPermission("MANAGE_NICKNAMES")){
				return message.reply(`:no_entry: I do not have permission to fetch ths nickname history of this guild!`)
			}
			const m: Message = await message.channel.send(":hourglass: One moment, please... ") as Message;

			let userToFetchNicks: GuildMember = null;
			userToFetchNicks = await message.guild.members.cache.get(args[0].replace(/[^\w\s]/gi, ''));
			if(!userToFetchNicks){
				return m.edit(`:no_entry: I was unable to fetch the user that you provided! Please make sure they are still inside of this guild!`);
			}

			let psGuild = await bot.pulsarGuilds.get(message.guild.id);
			let guildNicknameHistory = psGuild.nickname_history;
			let thisUsersHistoryUnformatted: object[] = guildNicknameHistory[userToFetchNicks.id];
			if(!thisUsersHistoryUnformatted || thisUsersHistoryUnformatted.length < 2) return m.edit(`:no_entry: This user doesn't have any recorded nickname changes!`);
			let thisUsersHistory: object[] = null;
			if(thisUsersHistoryUnformatted.length > 5){
				let i = 0;
				thisUsersHistory = thisUsersHistoryUnformatted.slice(Math.max(thisUsersHistoryUnformatted.length - 5, 0)); // Last 5 entries
			}
			else {
				thisUsersHistory = thisUsersHistoryUnformatted
			}

			if(!bot.config.botAdmins.includes(message.author.id)) thisUsersHistory = await thisUsersHistory.filter(async object => !await antiDoxScreen.checkDox((<any> object).newNickname) &&! await antiDoxScreen.checkDox((<any> object).oldNickname));

			function convertMS(milliseconds): object {
				let day, hour, minute, seconds;
				seconds = Math.floor(milliseconds / 1000);
				minute = Math.floor(seconds / 60);
				seconds = seconds % 60;
				hour = Math.floor(minute / 60);
				minute = minute % 60;
				day = Math.floor(hour / 24);
				hour = hour % 24;
				return {
					day: day,
					hour: hour,
					minute: minute,
					seconds: seconds
				};
		}

		let formattedArray: object[] = [];

		await AsyncForEachModule.asyncForEach(thisUsersHistory, async object => {
			object.timeAgo = convertMS(Date.now() - object.timestamp);
			formattedArray.push(object);
		})
		
		let entries:string[] = [];

		await AsyncForEachModule.asyncForEach(formattedArray, async object => {
			let string;

			switch (object.type){
				case "newNick": 
					if(object.timeAgo.minute > 60 || object.timeAgo.hour > 0 || object.timeAgo.day > 0 ){
						string = `   :clock1: **${object.timeAgo.hour} hour(s) and ${object.timeAgo.minute} minute(s) ago**: Set nickname to \`${object.newNickname}\``
					}
					else {
						string = `   :clock1: **${object.timeAgo.minute} minute(s) ago**: Set nickname to \`${object.newNickname}\``
					}
				break;

				case "nickReset":
					if(object.timeAgo.minute > 60 || object.timeAgo.hour > 0 || object.timeAgo.day > 0 ){
						string = `   :clock1: **${object.timeAgo.hour} hour(s) and ${object.timeAgo.minute} minute(s) ago**: Reset nickname (\`${object.oldNickname} => Nothing\`)`
					}
					else {
						string = `   :clock1: **${object.timeAgo.minute} minute(s) ago**: Reset nickname (\`${object.oldNickname} => Nothing\`)`
					}
				break;

				case "nickChange":
					if(object.timeAgo.minute > 60 || object.timeAgo.hour > 0 || object.timeAgo.day > 0 ){
						string = `   :clock1: **${object.timeAgo.hour} hour(s) and ${object.timeAgo.minute} minute(s) ago**: Changed nickname  (\`${object.oldNickname} => ${object.newNickname}\`)`
					}
					else {
						string = `   :clock1: **${object.timeAgo.minute} minute(s) ago**: Changed nickname  (\`${object.oldNickname} => ${object.newNickname}\`)`
					}
				break;
			}

			entries.push(string)
		})
		
		// Limit the nickname history to 8 entries per a user
		let guildNickHistory = psGuild.nickname_history;

		for(var prop in guildNickHistory){
			if(guildNickHistory[prop].length > 8){
				guildNickHistory[prop] = guildNickHistory[prop].slice(Math.max(guildNickHistory[prop].length - 8, 0)); // Last 8 entries
			}
		}
		await fs.writeFileSync(`./data/guilds/${psGuild.id}/nickname-history.json`, JSON.stringify(guildNickHistory, null, 4));

		return m.edit(`:information_source: Nickname History of ${userToFetchNicks.user.tag} (last 5 entries):\n${entries.join(`\n`)}`);
	}
}
