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
import fs from 'fs';
import axios from 'axios';
import { parse } from "querystring";

export {};

export default class Config extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"config", //NAME
		"Change a guild configuration setting in a server", //DESCRIPTION
		"config [configuration option] [new value]", //USAGE - [] = MANDATORY () = OPTIONAL
		["config actionchannel #mods-actions", "config reportchannel #dox-events"], //EXAMPLES
		CommandCategory.ADMINISTRATION, //CATEGORY
		1, //MIN ARGS
		2, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		10000, //SPAM TIMEOUT
		["chanesetting", "setting"] //ALIASES
	);


	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Config.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		if(!message.member.hasPermission("MANAGE_GUILD") &&! bot.config.botAdmins.includes(message.author.id)) return message.reply(`:x: You do not have permission to use this command!`);
		let pulsarGuild = await bot.pulsarGuilds.get(message.guild.id) // Get the pulsarguild
		let currentConfig: any = pulsarGuild.config;

		let inputConfig = args[0].toLowerCase();

		let validConfigSettings = ["reportchannel", "actionchannel", "starboardchannel", "starsrequired", "banondox", "funcommands", "cguild", "newaccountreporting", "logchannel", "imagelogchannel"];
		if(!validConfigSettings.includes(inputConfig) ||! args[1]) return message.reply(`:x: The configuration setting you provided is invalid! Valid configuration settings are: \`${validConfigSettings.join(", ")}\` `);

		function parseBoolean(input: string):boolean{
			let finalInput = input.toLowerCase();
			if(finalInput.includes(`true`) || finalInput.includes(`yes`) || finalInput.includes(`on`) || finalInput.includes(`enable`)){
				return true;
			}
			else return false;
		}

		function isValueNegative(input: string):boolean {
			let finalInput = input.toLowerCase();
			if(finalInput.includes(`false`) || finalInput.includes(`no`) || finalInput.includes(`off`) || finalInput.includes(`disable`)){
				return true;
			}
			else return false;
		}

		var channelName, channelToSet;
		var finalInput, switchValue;

		// Figure out what setting needs to be updated with what value
		switch(inputConfig){
			case "actionchannel":
				if(isValueNegative(args[1])){ // The input provided is false or something negative 
					currentConfig.actionChannel = false;
					break;
				}
				 channelName =`${message.content.replace(/\D/g,'')}`;
				 channelToSet = await message.guild.channels.cache.get(channelName);
				if(!channelToSet) return message.channel.send(`:x: The proper use for this command is: \`${bot.config.prefix}config actionchannel [#channel] \` `);
				currentConfig.actionChannel = channelToSet.id;
				break;

			case "reportchannel":
				if(isValueNegative(args[1])){ // The input provided is false or something negative 
					currentConfig.reportChannel = false;
					break;
				}
				 channelName = `${message.content.replace(/\D/g,'')}`
				 channelToSet = await message.guild.channels.cache.get(channelName)
				if(!channelToSet) return message.channel.send(`:x: The proper use for this command is: \`${bot.config.prefix}config reportchannel [#channel] \` `);
				currentConfig.reportChannel = channelToSet.id;
				break;

			case "logchannel":
					if(isValueNegative(args[1])){ // The input provided is false or something negative 
						currentConfig.logChannel = false;
						break;
					}
					 channelName =`${message.content.replace(/\D/g,'')}`
					 channelToSet = await message.guild.channels.cache.get(channelName)
					if(!channelToSet) return message.channel.send(`:x: The proper use for this command is: \`${bot.config.prefix}config logchannel [#channel] \` `);
					currentConfig.logChannel = channelToSet.id;
					break;

			case "imagelogchannel":
					if(isValueNegative(args[1])){ // The input provided is false or something negative 
						currentConfig.imageLogChannel = false;
						break;
					}
					 channelName =`${message.content.replace(/\D/g,'')}`
					 channelToSet = await message.guild.channels.cache.get(channelName)
					if(!channelToSet) return message.channel.send(`:x: The proper use for this command is: \`${bot.config.prefix}config imagelogchannel [#channel] \` `);
					currentConfig.imageLogChannel = channelToSet.id;
					break;

			case "starboardchannel":
					if(isValueNegative(args[1])){ // The input provided is false or something negative 
						currentConfig.starBoardChannel = false;
						break;
					}
					 channelName =`${message.content.replace(/\D/g,'')}`
					 channelToSet = await message.guild.channels.cache.get(channelName)
					if(!channelToSet) return message.channel.send(`:x: The proper use for this command is: \`${bot.config.prefix}config starboardchannel [#channel] \` `);
					currentConfig.starBoardChannel = channelToSet.id;
					break;
			
			case "banondox":
				finalInput = args[1].toLowerCase();
				if(!finalInput.includes(`true`) &&! finalInput.includes(`yes`) &&! finalInput.includes(`on`) &&! finalInput.includes(`enable`) &&! finalInput.includes(`false`) &&! finalInput.includes(`no`) &&! finalInput.includes(`off`) &&! finalInput.includes(`disable`)) return message.channel.send(`:x: You must provide the value of \`true/false\` or \`on/off\`!`);
				
				switchValue = parseBoolean(args[1]);
				currentConfig.doxEnabled = switchValue;
				break;
			
			case "funcommands":			
				finalInput = args[1].toLowerCase();
				if(!finalInput.includes(`true`) &&! finalInput.includes(`yes`) &&! finalInput.includes(`on`) &&! finalInput.includes(`enable`) &&! finalInput.includes(`false`) &&! finalInput.includes(`no`) &&! finalInput.includes(`off`) &&! finalInput.includes(`disable`)) return message.channel.send(`:x: You must provide the value of \`true/false\` or \`on/off\`!`);
				switchValue = parseBoolean(args[1]);
				currentConfig.funCommands = switchValue;
				break;
			
			case "cguild":
				finalInput = args[1].toLowerCase();
				if(!finalInput.includes(`true`) &&! finalInput.includes(`yes`) &&! finalInput.includes(`on`) &&! finalInput.includes(`enable`) &&! finalInput.includes(`false`) &&! finalInput.includes(`no`) &&! finalInput.includes(`off`) &&! finalInput.includes(`disable`)) return message.channel.send(`:x: You must provide the value of \`true/false\` or \`on/off\`!`);
				switchValue = parseBoolean(args[1]);
				currentConfig.cguild = switchValue;
				break;
			
			case "newaccountreporting":
				finalInput = args[1].toLowerCase();
				if(!finalInput.includes(`true`) &&! finalInput.includes(`yes`) &&! finalInput.includes(`on`) &&! finalInput.includes(`enable`) &&! finalInput.includes(`false`) &&! finalInput.includes(`no`) &&! finalInput.includes(`off`) &&! finalInput.includes(`disable`)) return message.channel.send(`:x: You must provide the value of \`true/false\` or \`on/off\`!`);
				switchValue = parseBoolean(args[1]);
				currentConfig.reportNewAcc = switchValue;
				break;
			
			case "starsrequired":
				if(!currentConfig.starBoardChannel) return message.reply(`:x: Starboard is disabled in this guild! Please set up the configuration option of starboardchannel to enable the starboard!`);
				if(!parseInt(args[1])) return message.reply(`:x: The configuration value you provided is invalid! It must be a number from 2-50!`);
				if(parseInt(args[1]) > 50 || parseInt(args[1]) < 3) return message.reply(`:x: The configuration value you provided is invalid! It must be a number from 2-50!`);
				currentConfig.starsNeeded = parseInt(args[1]);
				break;
			default:
				return message.reply(`:x: The configuration setting you provided is invalid! Valid configuration settings are: \`${validConfigSettings.join(", ")}\` `);
		}

		let configurationPath = `./data/guilds/${message.guild.id}/config.json`;
		await fs.writeFileSync(configurationPath, JSON.stringify(currentConfig, null, 4));
		return message.channel.send(`:white_check_mark: Successfully updated configuration setting \`${args[0].toLowerCase()}\` to the value of \`${args[1].replace(/[<>]/g, ``)}\`!`);
	}
}

/*
{
    "reportChannel": false,
    "cguild": true,
    "actionChannel": false,
    "funCommands": true,
    "doxEnabled": true,
    "reportNewAcc": false,
    "customBannedWords": [
        ""
    ],
    "logChannel": false,
    "imageLogChannel": false,
    "starBoardChannel": false,
    "starsNeeded": 10
}
*/