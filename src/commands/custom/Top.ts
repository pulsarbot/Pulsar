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
export default class Top extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"top", //NAME
		"Shows the top 10 users by OBH guild level", //DESCRIPTION
		"top [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["top"], //EXAMPLES
		CommandCategory.CUSTOM, //CATEGORY
		0, //MIN ARGS
		0, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		["451248270409334796", "544276344792678410"], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		10000, //SPAM TIMEOUT
		["leaderboard", "rankings", "lb"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Top.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count	
		super.assertArgCount(args.length , message);

		let leveledConfig = await JSON.parse(fs.readFileSync(`./data/modules/bh/leveledConfig.json`).toString());
		let levels = JSON.parse(fs.readFileSync(`./data/modules/bh/levels.json`, 'utf8'))
		let unsorted = []
		for (var prop in levels) {
			unsorted.push(levels[prop])
		}
		let sorted = unsorted.sort(function(a, b) {
			return b - a
		});
		sorted.length = 10
		let userArray = []
		
		function getKeyByValue(object, value) {
			return Object.keys(object).find(key => object[key] === value);
		}
		sorted.forEach(number => {
			userArray.push(getKeyByValue(levels, number))
		})
		userArray.length = 10

		// I attempted to make this a loop, but it kept on breaking

		if (!userArray[9]) return message.reply(":x: Not enough people have talked to fit 10 people on the LB")
		let user1 = await bot.fetchUser(userArray[0])
		let user2 = await bot.fetchUser(userArray[1])
		let user3 = await bot.fetchUser(userArray[2])
		let user4 = await bot.fetchUser(userArray[3])
		let user5 = await bot.fetchUser(userArray[4])
		let user6 = await bot.fetchUser(userArray[5])
		let user7 = await bot.fetchUser(userArray[6])
		let user8 = await bot.fetchUser(userArray[7])
		let user9 = await bot.fetchUser(userArray[8])
		let user10 = await bot.fetchUser(userArray[9])
		let embed = new Discord.MessageEmbed() 
			.setAuthor(`Leaderboard [Top 10] - ${message.guild.name}`)
			.setColor(`#1fff00`).setThumbnail(message.guild.iconURL())
			.addField(`#1`, ` ${user1.tag}. Level: ${sorted[0]} `)
			.addField(`#2`, ` ${user2.tag}. Level: ${sorted[1]} `)
			.addField(`#3`, ` ${user3.tag}. Level: ${sorted[2]} `)
			.addField(`#4`, ` ${user4.tag}. Level: ${sorted[3]} `)
			.addField(`#5`, ` ${user5.tag}. Level: ${sorted[4]} `)
			.addField(`#6`, ` ${user6.tag}. Level: ${sorted[5]} `)
			.addField(`#7`, ` ${user7.tag}. Level: ${sorted[6]} `)
			.addField(`#8`, ` ${user8.tag}. Level: ${sorted[7]} `)
			.addField(`#9`, ` ${user9.tag}. Level: ${sorted[8]} `)
			.addField(`#10`, ` ${user10.tag}. Level: ${sorted[9]} `)
			.setTimestamp()
			.setFooter(`Leaderboard - ${message.guild.name}`);
		
		message.channel.send(embed)

	}

}
