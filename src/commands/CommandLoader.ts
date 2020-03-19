import * as Discord from 'discord.js';
import * as dotEnv from 'dotenv';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import chalk from 'chalk';

import {CommandCategory} from '../modules/commandapi/CommandCategory';
import {bot, cmdInterpreter, cmdConsole} from '../index';
import CommandList from '../commands/core/CommandList';
import Command from '../modules/commandapi/Command';

let scriptName: string = path.basename(__filename).toString();



module.exports.loadCommands = () => {

let version = '';

if(scriptName.toLowerCase().endsWith(`.ts`)) version = `ts`;
else version = 'js';

//let commandsToSkip:string[] = ["commandlist"]; // MUST BE IN LOWERCASE
let commandsToSkip:string[] = ["test"]; // MUST BE IN LOWERCASE

glob(__dirname + '/**/*.*', {absolute: false}, (error, files) => {
	files = files.filter(f => !f.endsWith(`.map`));
	if (files.length === 0) return console.log('[WARNING] Unable to locate any commands. Pulsar won\'t be able to respond to requests.');
	else console.log(chalk.yellow(`[COMMAND] Loading ${files.length} commands...`));

	let i:number = 0;
	files.forEach(async filePath => {
		let fileRegex = new RegExp(/\/{0}([A-z-/\d]){1,100}([^A-z.ts]){1}/g); // converts the whole url path to just commandFileName.ts
		let fileRegexJS = new RegExp(/\/{0}([A-z-/\d]){1,100}([^A-z.js]){1}/g);
		let formattedBestCMD:string = null;
		
		if(version == `ts`) filePath.replace(fileRegex, '');
		else filePath.replace(fileRegexJS, ``)
		//Check if the current search directory is the folder for the command utilities
		if(filePath.toLowerCase().includes("util")){
			//Simply skip the folder, as this folder is for command class utilities and isn't meant to be registered with the interpreter
			return;
		}

		try {
			if(commandsToSkip.includes(formattedBestCMD.toLowerCase()) || commandsToSkip.includes(filePath.toLowerCase())){ // Checks if the file name is blacklisted
				console.log(chalk.red(`[COMMAND] Skipping command - ${formattedBestCMD}`));
				return;
			}
		}
		catch {
			null
		}

		let cmd = require(filePath);

		if(!cmd.default) return;

		//Define the command instance to register
		let cmdObj:Command = null;

		//Check if the command requires the interpreter as a parameter via reflection
		if(Reflect.has(new cmd.default(), "cmdInterpreter")){
			//Create an instance of the command with the interpreter parameter
			cmdObj = (new cmd.default(cmdConsole, cmdInterpreter));
		}
		else {
			//Create a new instance normally
			cmdObj = (new cmd.default(cmdConsole));
		}

		if(commandsToSkip){
			let foundAMatch = false;

			cmdObj.aliases.forEach(item => {
				if(commandsToSkip.includes(item.toLowerCase())) foundAMatch = true
			})

			if(commandsToSkip.includes(cmdObj.name) || foundAMatch){
				console.log(chalk.red(`[COMMAND] Skipping command ${cmdObj.name} [${CommandCategory[cmdObj.category]}]`));
				return;
			}
		}

		//Try to register the command
		try {
			//Register the command with the interpreter
			cmdInterpreter.register(cmdObj);
			console.log(`[COMMAND] ${i + 1}: ${cmdObj.name} [${CommandCategory[cmdObj.category]}] - registered successfully!`);
		}
		catch(err){
			//Report the error
			console.log(chalk.red(`[COMMAND/ERROR] ${i + 1}: ${cmdObj.name} [${CommandCategory[cmdObj.category]}] - ${err.name} caught while trying to register: ${err.message}`));
		}

		i++;
	})

});

}