//Import first-party classes
import ArrayUtil from "../../../util/ArrayUtil";
import AsyncUtil from '../../../util/AsyncUtil';
import Command from "../Command";
import CommandArgException from "../exception/CommandArgException";
import Console from "./Console";
import InterpreterException from "./InterpreterException";
import Pulsar from "../../../handlers/Pulsar";
import StringUtil from "../../../util/StringUtil";

//Import core Node modules and dependencies
import Discord from "discord.js";
import { CommandCategory } from "../CommandCategory";

/**
 * Interprets incoming commands from the user
 * and passes the arguments on to the relevant 
 * command given the command exists by name or
 * an alias is matched
 * @author Spotlightsrule
 */
export default class Interpreter {
	//Set class variables
	private registeredCommands:Command[];
	private botClient:Pulsar;
	private cmdConsole:Console;
	
	//Class constructor
	/**
	 * Constructs a new interpreter instance
	 * @param botClient The bot class instance
	 * @param cmdConsole The bot's main console class
	 */
	constructor(botClient:Pulsar, cmdConsole:Console){
		//Initialize the registered commands ArrayList
		this.registeredCommands = [];
		
		//Assign the class variables from the constructor's parameters
		this.cmdConsole = cmdConsole;
		this.botClient = botClient;
	}
	
	//Getters
	/**
	 * Fetches every command that is
	 * registered with the interpeter
	 * @return <b>Command[]</b> An array of all the registered commands
	 */
	public getRegisteredCommands():Command[] {
		return this.registeredCommands;
	}

	/**
	 * Fetches a command class instance
	 * by its name or an alias
	 * @param comName The name of the command to fetch
	 * @return <b>Command</b> The found command class, null if not found
	 */
	public getRegisteredCommand(comName:string):Command {
		//Run a for loop over all of the registered commands
		for(let i in this.registeredCommands){
			//Get the current registered command
			let curCom:Command = this.registeredCommands[i];

			//Check if the input command name equals the name or alias of a registered command
			if((comName.toLowerCase() === curCom.name.toLowerCase()) || (StringUtil.equalsAny(comName, curCom.aliases, true))){
				//Return the instance of the registered command by that name
				return curCom;
			}
		}
		
		//Return null because a command by that name wasn't found
		return null;
	}

	/**
	 * Registers a command class instance with
	 * the interpreter. This step MUST be done
	 * in order for the interpreter to "see" the
	 * command. Make sure to call this method
	 * whenever you create a new command instance,
	 * but don't regster the same command or alias 
	 * twice unless you're "crash-happy"
	 * @param comInst The command class instance to register (DO NOT DOUBLE-REGISTER)
	 */
	public register(comInst:Command):void {
		//Loop over the list of registered commands to check for duplicates of both names and aliases
		for(let i in this.registeredCommands){
			//Get the currently registered command
			const regCom:Command = this.registeredCommands[i];

			//Check if the input command object has the same name as the current existing command
			if(comInst.name.toLowerCase() === regCom.name.toLowerCase()){
				//Throw an InterpreterException because the same command can't be registered twice
				throw new InterpreterException("The same command can't be registered twice.");
			}

			//Loop over the aliases of the command to register
			for(let i in comInst.aliases){
				//Check if the input command object's current alias is the same as one in the current existing command
				if(StringUtil.equalsAny(comInst.aliases[i], regCom.aliases, true)){
					//Throw an InterpreterException because the same command alias can't be registered twice
					throw new InterpreterException("The same command alias can't be registered twice.");
				}
			}
		}

		//Check if the input command object has duplicated aliases or an alias that is the same as the name of the command
		if((comInst.aliases.length !== new Set(comInst.aliases).size) || (StringUtil.equalsAny(comInst.name, comInst.aliases, true))){
			//Throw an InterpreterException because a command can't have duplicated aliases or the name of the command as an alias
			throw new InterpreterException("Command aliases can't contain duplicate entries or the name of the command.");
		}
		
		//Add the command instance to the list of registered commands
		this.registeredCommands.push(comInst);
	}

	//Entrance command interface
	/**
	 * Executes a command by name or alias.
	 * This is to be run whenever a message
	 * contains the bot prefix at the start 
	 * of the message contents 
	 * (eg: ps!<command> <args>)
	 * @param message The message instance that called the command
	 * @param args The arguments for the command, with args[0] always being the name of the command
	 * @return <b>Promise&lt;any&gt;</b> The status of the command execution operation once asynchronous flow finishes
	 */
	public async execute(message:Discord.Message, args:string[]):Promise<any> {
		//Set a variable to hold the command to use in the execution
		let execCom:Command = null;

		//Loop over the list of registered commands
		await AsyncUtil.asyncForEach(this.registeredCommands, async (exsCom) => {
			//Check if the command sent by the user in args[0] matches the current registered command's name or an alias of that command
			if((args[0].toLowerCase() === exsCom.name.toLowerCase()) || (StringUtil.equalsAny(args[0], exsCom.aliases, true))){
				//Set the command to execute as the current command instance in the loop
				execCom = exsCom;

				//Break out of the loop
				return;
			}
		});

		//Check if a valid command was found
		if(execCom && execCom !== null){
			//TODO: Add user blacklist check

			//Check if the guild where the command was issued is not whitelisted (PRE-EXECUTE PRIORITY: 2)
			if((execCom.whitelistedGuilds.length >= 1) && (!StringUtil.equalsAny(message.guild.id, execCom.whitelistedGuilds, false))){
				//Warn that the guild is not whitelisted
				await message.reply(`:no_entry_sign: This command isn't allowed to be used in this guild. Please check with a bot administrator to see which guild(s) this command is allowed in.`);

				//Resolve the promise, as the guild isn't whitelisted, but return true because everything else went smoothly
				return Promise.resolve(true);
			}

			//Check if the command is a fun or nsfw command (PRE-EXECUTE PRIORITY: 3)
			if((execCom.category === CommandCategory.FUN) || (execCom.category === CommandCategory.NSFW)){
				//Get the config for the guild
				const guildConf:any = (this.botClient.pulsarGuilds.get(message.guild.id).config);

				//Check if the guild has denied access to fun and nsfw commands
				if((typeof guildConf.funCommands !== 'undefined') && !guildConf.funCommands){
					//Warn that fun and nsfw commands have been disabled
					await message.reply(`:no_entry_sign: Fun and NSFW commands have been disabled in this guild :slight_frown:.`);

					//Check if the sender has guild management permissions
					if(message.member.permissions.has("MANAGE_GUILD")){
						//Add that this setting can be enabled using a command
						await message.reply(`:bulb: This setting can be toggled via running \`${this.botClient.config.prefix}config funcommands [true/false]\`.`)
					}

					//Resolve the promise, as the guild doesn't allow fun commands, but return true because everything else went smoothly
					return Promise.resolve(true);
				}
			}

			//Check if the user is being limited by the anti-spam timer for the command and they aren't a trusted bot user (PRE-EXECUTE PRIORITY: 4)
			if(!execCom.antiSpamAllowMsg(message.member) && !((this.botClient.config.botAdmins.includes(message.author.id)) || (message.author.id === this.botClient.config.ownerID))){
				//Warn the sender that they have to wait x seconds
				await message.reply(`:alarm_clock: You are being rate limited. Please wait ${Math.floor(execCom.spamTimeout / 1000)} second(s) before using this command again!`);

				//Resolve the promise, as the user has to wait for the timer to expire, but return true because everything else went smoothly
				return Promise.resolve(true);
			}

			//Check if the command is locked down to trusted users only (PRE-EXECUTE PRIORITY: 5)
			if(execCom.trustedOnly || execCom.ownerOnly){
				//Get the ID of the message author
				let authId:string = message.author.id;

				//Set a boolean to test if the sender has permission
				let hasPerm:boolean = false;

				//CASE 1: Check if the command is trusted only and the sender is either a trusted admin or the owner
				if(execCom.trustedOnly && ((this.botClient.config.botAdmins.includes(authId)) || (authId === this.botClient.config.ownerID))){
					//Allow the sender access to the command
					hasPerm = true;
				}

				//CASE 2: Check if the command is owner-only and the sender is the owner
				if(execCom.ownerOnly && (authId === this.botClient.config.ownerID)){
					//Allow the sender access to the command
					hasPerm = true;
				}

				//Check if the sender lacks the permission to use the command
				if(!hasPerm){
					//Set the required position that the user must be in order to use the command (default is trusted)
					let missingPos:string = "a trusted bot admin";

					//Check if the command is owner only and the sender is not the owner or a trusted bot dev
					if((execCom.ownerOnly) && (authId !== this.botClient.config.ownerID || !this.botClient.config.botAdmins.includes(authId))){
						//Set the missing position as the bot owner
						missingPos = "the bot owner";
					}

					//Compose the response message and reply to the command sender
					await message.reply(`:lock: Sorry, but you lack the proper permissions to run this command because you are not ${missingPos}.`);

					//Resolve the promise, as the user lacked the permission to run the command, but return true because everything else went smoothly
					return Promise.resolve(true);
				}
			}

			//Check if the user lacks the permission to run the command (PRE-EXECUTE PRIORITY: 6)
			if(!(execCom.hasPermission(message.member))){
				//Easter egg: set the permission denied prefix messages that can be sent
				let permDeniedPrefixes:string[] = ["Hold it right there, partner.", "Oh my buddha.", "HEY!", "Slow down there, turbo.", "Easy there, pal."];

				//Get the permissions that the user lacked
				let missingPerms:string[] = (await execCom.getMissingPerms(message.member));

				//Compose the response message and reply to the command sender
				await message.reply(`:lock: ${ArrayUtil.getRandomArrElem(permDeniedPrefixes)} Sorry, but you lack the proper permissions to run this command. You're missing the following permission(s): \`${ArrayUtil.toList((execCom.getMissingPerms(message.member)), ", ")}\`.`);

				//Resolve the promise, as the user lacked the permission to run the command, but return true because everything else went smoothly
				return Promise.resolve(true);
			}

			//Check if the command is NSFW (category: nsfw) and the sending channel is not nsfw-friendly (PRE-EXECUTE PRIORITY: 7)
			if((execCom.category === CommandCategory.NSFW) && !((<Discord.TextChannel> message.channel).nsfw)){
				//Warn the user that the command can't be run because the channel isn't nsfw
				await message.reply(`:underage: Sorry, but "${execCom.name}" is an NSFW command, which is disallowed outside of NSFW-safe channels. Please try your input again in a text channel that allows NSFW content.`);

				//Resolve the promise, as the command is for NSFW channels only, but return true because everything else went smoothly
				return Promise.resolve(true);
			}

			//Check if the bot should start typing in chat (PRE-EXECUTE PRIORITY: 8)
			if(execCom.simulateTyping){
				//Begin typing in chat
				message.channel.startTyping();
			}

			//Execute the relevant method for that command via the implemented ICommand interface
			await execCom.run(this.botClient, message, (args.slice(1, (args.length))), args[0]).then(async cmdResponse => {
				//Log the event to the console
				//this.cmdConsole.out(`User ${message.author.tag} (${message.author.id}) successfully ran command "${args[0]}" with arguments "${args.slice(1).join(" ")}" in server "${message.guild.name} (${message.guild.id})"`);
			})
			.catch(error => {
				//Check if the error is related to arguments
				if(error.name === CommandArgException.name){
					//Set the argument info string
					let argInfo:string = (`between ${execCom.minArgs} and ${execCom.maxArgs}`);
					
					//Check if the counts are the same or the maximum allowed is 0
					if((execCom.minArgs === execCom.maxArgs) || (execCom.maxArgs === 0)){
						//Set the argument info string to reflect that
						argInfo = ((execCom.maxArgs === 0) ? `no` : `${execCom.minArgs}`);
					}

					//Check if at least one of the limits was overridden (minimum args can't be lower than 0 in any case, so its override number is 0 instead of -1)
					else if((execCom.minArgs <= 0) || (execCom.maxArgs < 0)){
						//Select the type of single-ended cap to report
						let capType:string = ((execCom.maxArgs < 0) ? "at least" : "no more than");

						//Select which of the argument caps to use
						let capNumber:number = ((execCom.maxArgs < 0) ? execCom.minArgs : execCom.maxArgs);

						//Change the argument info to display this info
						argInfo = (`${capType} ${capNumber}`);
					}	
					
					//Report the argument excpetion to the user and suggest the correct usage
					message.reply(`The command "${args[0]}" requires ${argInfo} argument(s), but the amount you supplied was ${args.length - 1}. The correct usage is \`${this.botClient.config.prefix}${execCom.usage}\`. Try your entry again.`);
				}
				else {
					//Report the generic error to the user
					message.reply(`An error occurred while running command "${args[0]}". Error details: \`${error.name} - ${error.message}\`. Try your entry again.`);

					//Report the error to the console
					this.cmdConsole.out(error);
				}
			})
			.finally(async () => {
				//Check if the sender's message should be deleted
				if(execCom.deleteOnFinish){
					//Delete the sender's message
					await message.delete();
				}

				//Check if the bot should simulate typing
				if(execCom.simulateTyping){
					//Stop typing (We aren't going to write an essay)
					await (message.channel.stopTyping());
				}
			});
		}
		else {
			//No match, so warn the user that an invalid command was called
			//message.channel.send("ERROR: " + args[0] + " is an unknown command. Type " + "\"list\"" + " for a list of valid commands.");
			await message.reply(`ERROR: "${args[0]}" is an unknown command. Type \`${this.botClient.config.prefix}commandlist\` for a list of valid commands.`);

			//Return false, as a valid command wasn't found
			return Promise.resolve(false);
		}
	}
	
	//Utilities
	/**
	 * Get the list of commands that are
	 * actively registered with the interpreter.
	 * Returns "(none)" if no commands are
	 * registered
	 * @return <b>string</b> The list of registered commands or lack thereof
	 */
	public getRegisteredCommandList(category?:CommandCategory):string {
		//Create a variable to store the commands to loop over (can be overwritten depending on if there are categories to match)
		let registeredCommands:Command[] = this.registeredCommands;

		//Check if the category parameter is filled and the value is valid
		if((typeof(category) !== "undefined")){
			//Clear the registered command list
			registeredCommands = [];

			//Loop over the list of the registered commands
			for(let i=0; i<this.registeredCommands.length; i++){
				//Check if the current command's category matches the input category
				if(this.registeredCommands[i].category === category){
					//Push the current command onto the registered command list
					registeredCommands.push(this.registeredCommands[i]);
				}
			}
		}

		//Check if the registered command list has at least one command
		if(registeredCommands.length >= 1){
			//Create a string to hold the list of registered commands
			let regCmd:string = "";

			//Loop over the list of the registered commands
			for(let i=0; i<registeredCommands.length; i++){
				//Check if the category parameter is filled and the value is valid
				if((typeof(category) !== "undefined")){
					//Check if the current command's category matches the input category
					if(registeredCommands[i].category === category){
						//Append the name of the current command onto the string
						regCmd += (registeredCommands[i].name);
					}
				}
				else {
					//Append the name of the current command onto the string
					regCmd += (registeredCommands[i].name);
				}

				//Ensure that the current command is not at the end of the list
				if(i < (registeredCommands.length - 1)){
					//Append a delimiter onto the string
					regCmd += (", ");
				}
			}
			
			//Return the filled string
			return regCmd;
		}
		
		//Return "none", as there are no commands registered with the interpreter
		return ("(none)");
	}
}