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

import {MacroAPI} from '../../index';
import * as MacroAPIType from "../../handlers/MacroAPI";
import { Interface } from "readline";

export default class Macro extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"macro", //NAME
		"Runs a macro that is registered within the bot!", //DESCRIPTION
		"macro [macroName/Alias] (arguments)", //USAGE - [] = MANDATORY () = OPTIONAL
		["macro [deleteChannel] (258757935377809409)"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		false, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["runmacro", "loadmacro"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Macro.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

		//Assert the argument count
		super.assertArgCount(args.length , message);

		let macroToCall: string = args[0] 
		if(!MacroAPI.macros.has(macroToCall)) return message.reply(`:x: That macro does not exist! Valid macros are: \`\`\`${MacroAPI.macroNames.join(`, `)}\`\`\``);

		let macro = await MacroAPI.macros.get(macroToCall);

		let macroInfoObject: any = macro.getElemTwo();
		if(parseInt(macroInfoObject.requiredArgs) && parseInt(macroInfoObject.requiredArgs) > 0 && args.shift().length < parseInt(macroInfoObject.requiredArgs)) return message.reply(`:x: Invalid arguments where provided for the macro \`${macroToCall}\`! Minimum number of arguments required is **${macroInfoObject.requiredArgs}**!`);
		
		let macroInfo = {
			"args": args,
			"user": message.author,
			"member": message.member,
			"guild": message.guild,
			"message": message
		}
		try{
			let run = macro.getElemThree();
			await run(bot, macroInfo, MacroAPI); // Run the macro!
		}
		catch (MacroError) {
			if(!MacroError) return;
			if(!MacroError || !MacroError.macroInfo ||! MacroError.errorMessage) return;
			return message.reply(`:no_entry: An error has occured while attempting to run the macro \`${MacroError.macroInfo.name}\`! Error: \`${MacroError.errorMessage}\``);
		}
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}
