//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, User, MessageEmbed } from "discord.js";
import fs from 'fs';
import glob from 'glob';

export default class CommunityBan extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"communityban", //NAME
		"Ban a user from a list of \'community guilds\'", //DESCRIPTION
		"cban [@member/userID] (@member/userID) (reason)", //USAGE - [] = MANDATORY () = OPTIONAL
		["cban [258757935377809409] (362938646304653312) (doxxing)", "cban [258757935377809409] (threats)"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["cban", "cb"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(CommunityBan.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

		let AsyncForEachModule: any = require(`../util/AsyncForEach`);

		//Assert the argument count
		super.assertArgCount(args.length , message);


		// Make sure the cban module is enabled
		if(!bot.config.cban.moduleEnabled){
			return message.reply(`:no_entry: Community bans are disabled bot-wide. Please contact severepain about this if you believe this is a mistake!`)
		}

		// Parse all of the arguments
		// If the first argument is not a user, return
		// The regex filters out any characters that are not numbers or strings, converting pings into just the user IDs
		if(!await bot.users.cache.get(args[0].replace(/[^\w\s]/gi, ''))){
			return message.reply(`:no_entry: The ID \`${args[0]}\` is invalid!`)
		}

		let guildsToBanFrom: string[] = []


		await bot.pulsarGuilds.forEach(async guild => {
			if(guild.config["cguild"] == true){
				guildsToBanFrom.push(guild.id)
			}
		});

		// Loop through all of the arguments and categorize them
		let reasonArr: string[] = [];
		let userIDArr: string[] = [];

		let cbannedUsersJSONTemp = await JSON.parse(fs.readFileSync(`./data/community-bans.json`).toString());
		await AsyncForEachModule.prototype.asyncForEach(args, async item => {
			let formattedItem = item.replace(/[^\w\s]/gi, '');
			if(!parseInt(formattedItem) || formattedItem.length !== 18){ // If the value provided is NOT a user ID, assume it is a reason
				reasonArr.push(item);
			}
			else if(bot.users.cache.get(formattedItem)){
				if(!bot.config.botAdmins.includes(formattedItem) &&! item.includes(bot.user.id) && cbannedUsersJSONTemp[formattedItem]){ // You cannot ban bot admins
					userIDArr.push(formattedItem);
				}
			}
		
		});

		// Now that we have divided everything, actually commit to the banning
		/*
		console.log(userIDArr);
		console.log(reasonArr);
		console.log(guildsToBanFrom);
		*/

		let toReportChannel = bot.config.cban.cbanReportChannelID;
		let cbanReason: any = reasonArr.join(" ") || null;
		
		await AsyncForEachModule.prototype.asyncForEach(guildsToBanFrom, async guildID => {

			let guild = await bot.pulsarGuilds.get(guildID);

			await AsyncForEachModule.prototype.asyncForEach(userIDArr, async userIDToBan => {
				if(await guild.banlist.isBanned(userIDToBan)) return; // The user is already banned in the guild, move on
				let userToBan: User = await bot.users.cache.get(userIDToBan);
				try {
				await guild.ban(userToBan, {days: 1, reason: `Community Ban - ` + cbanReason});
				}
				catch {
					return;
				}
			})

		})



		let userFormattedArr: string[] = [];
		await AsyncForEachModule.prototype.asyncForEach(userIDArr, async ID => {
			let user: User = await bot.users.cache.get(ID);
			if(!user) return;
			userFormattedArr.push(`${user.tag} [${user.id}]`);

			// Log the community ban into the community bans file
			let cbannedUsersJSON = await JSON.parse(fs.readFileSync(`./data/community-bans.json`).toString());
			cbannedUsersJSON[`${user.id}`] = {
				timestamp: Date.now(),
				reason: cbanReason,
				bannedBy: message.author.id
			}
			await fs.writeFileSync('./data/community-bans.json', JSON.stringify(cbannedUsersJSON, null, 4)); // Write to the file

			// Create The RichEmbed and send it
			let toReportEmbed = new MessageEmbed()
			.setDescription("Community Ban")
			.setColor("#000000")
			.setThumbnail(user.avatarURL())
			.addField("Community Banned User", `${user} (${user.tag}) with ID ${user.id}`)
			.addField("Reason", `${cbanReason}`)
			.addField("Issued In Guild", `${message.guild.name} [${message.guild.id}]`)
			.addField("Issued By", `${message.author} (${message.author.tag}) with id ${message.author.id}`)
			.setTimestamp()
			.setFooter('Pulsar Community Ban', message.author.avatarURL());
			let reportChannel = await bot.channels.cache.get(toReportChannel) as TextChannel;
			await reportChannel.send(toReportEmbed);
		})


		if(!userFormattedArr){
			await message.reply(`:no_entry: None of the users you provided where banned. Please make sure you had acceptable arguments!`);
		}
		await message.reply(`:white_check_mark: Community Banned \`${userFormattedArr.join(", ")}\`!`);


		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}
