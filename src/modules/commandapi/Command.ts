//Import first-party classes
import AsyncUtil from "../../util/AsyncUtil";
import CommandArgException from "./exception/CommandArgException";
import { CommandCategory } from "./CommandCategory";
import CommandException from "./exception/CommandException";
import Console from "./interpreter/Console";
import ICommand from "./ICommand";
import ICommandField from "./ICommandField";
import MathUtil from "../../util/MathUtil";
import Pair from "../../util/Pair";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";

/**
 * Forms the basis of all command classes
 * @author Spotlightsrule
 */
export default abstract class Command implements ICommand, ICommandField {
	//Set command fields
	public name:string;
	public description:string;
	public usage:string;
	public examples:string[];
	public category:CommandCategory;
	public minArgs:number;
	public maxArgs:number;
	public permsRequired:string[];
	public ownerOnly:boolean;
	public trustedOnly:boolean;
	public blacklistedUsers:string[];
	public whitelistedGuilds:string[];
	public deleteOnFinish:boolean;
	public simulateTyping:boolean;
	public spamTimeout:number;
	public aliases?:string[];

	//Set class variables
	private cmdConsole:Console;
	private timeoutSet:Set<string>;

	/**
	 * Constructs a new command instance
	 * @param commandFields The properties of the command
	 * @param cmdConsole The reporting console
	 */
	constructor(commandFields:ICommandField, cmdConsole:Console){
		//Assign the command fields
		this.name = commandFields.name;
		this.description = commandFields.description;
		this.usage = commandFields.usage;
		this.examples = commandFields.examples;
		this.category = commandFields.category;
		this.permsRequired = commandFields.permsRequired;
		this.ownerOnly = commandFields.ownerOnly;
		this.trustedOnly = commandFields.trustedOnly;
		this.blacklistedUsers = commandFields.blacklistedUsers;
		this.whitelistedGuilds = commandFields.whitelistedGuilds;
		this.deleteOnFinish = commandFields.deleteOnFinish;
		this.simulateTyping = commandFields.simulateTyping;
		this.spamTimeout = commandFields.spamTimeout;

		//Check if the min arg count is greater than the max args count and the max args variable isn't less than 0
		if((commandFields.minArgs > commandFields.maxArgs) && (commandFields.maxArgs >= 0)){
			//Throw a CommandException because the min arg count can't be greater than the max arg count
			throw new CommandException("Min arg count can't exceed max arg count");
		}
		else {
			//Assign the min and max args variables as usual
			this.minArgs = commandFields.minArgs;
			this.maxArgs = commandFields.maxArgs;
		}

		//Check if the aliases field is defined and assign a blank array to the aliases field if it isn't
		commandFields.aliases ? this.aliases = commandFields.aliases : [];

		//Assign the class variables from the constructor's parameters
		this.cmdConsole = cmdConsole;
		this.timeoutSet = new Set();
	}

	//Define the command executor as abstract so its implementation is passed down to subclasses
	abstract async run<T>(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<T>;

	/**
	 * Asserts that the argument count 
	 * for the command is within the min
	 * and max range
	 * @param argCount The number of arguments passed to the command
	 * @throws CommandArgException If the command has a bad argument count
	 */
	public assertArgCount(argCount:number, message:Discord.Message):void {
		//Assign the minimum and maximum argument counts to throwaway variables to avoid modifications of the class variables
		let minArgs:number = this.minArgs;
		let maxArgs:number = this.maxArgs;

		//Check if the lower and upper bound arguments are less than 0 and set their values to just beyond the current argument count (fools the argument count assertion that these are within acceptable range, effectively removing the bound all together)
		minArgs = ((minArgs <= 0) ? (argCount - 1) : minArgs);
		maxArgs = ((maxArgs < 0) ? (argCount + 1) : maxArgs);

		//Check if the argument count is within the limits set for this command
		if(!(MathUtil.numberInRange(argCount, minArgs, maxArgs))){
			//Create a string array to hold the phrases used for reporting the bad argument count
			let argLimPhrases:string[] = ["Not enough", "minimum", minArgs.toString()];
			
			//Check if the argument count was above the limit
			if(argCount > maxArgs){
				//Set the bad argument phrases to their maximum counterparts instead
				argLimPhrases[0] = ("Too many");
				argLimPhrases[1] = ("maximum");
				argLimPhrases[2] = (maxArgs.toString());
			}

			//Throw a CommandArgException because the argument count is invalid (catch responsibility rests with the interpreter)
			throw new CommandArgException(`${argLimPhrases[0]} arguments supplied for command "${this.name}". The ${argLimPhrases[1]} allowed is ${argLimPhrases[2]}`);
		}
	}

	/**
	 * Check if a member has permission to
	 * run a particular command given the
	 * command has the permissions field
	 * populated and the permissions are
	 * valid Discord permission flags
	 * @param msgSender The sender of the command
	 * @return <b>boolean</b> The status as to whether the user has permission to run the command
	 */
	public hasPermission(msgSender:Discord.GuildMember):boolean {
		//Return the status as to whether the sender has permission or not
		return (this.hasReqPerms(msgSender, this.permsRequired));
	}

	/**
	 * Helper function for Command#hasPermission
	 * @param msgSender The sender of the command
	 * @param permsRequired The required permission for the operation
	 * @return <b>boolean</b> The status as to whether the user has permission to run the command
	 */
	private hasReqPerms(msgSender:Discord.GuildMember, permsRequired:string[]):boolean {
		//Loop over the list of permissions the command requires
		for(let permIndex in permsRequired){
			//Get the permission at the current index
			let curPerm:string = (permsRequired[permIndex]);

			//Check if the current permission is valid
			if(Discord.Permissions.FLAGS[curPerm]){
				//Check if the user possesses the current permission
				let hasPermission:boolean = (msgSender.hasPermission(Discord.Permissions.FLAGS[curPerm]));

				//Check if the user lacks the current permission
				if(!(hasPermission)){
					//Return false because the user doesn't have access to the permission, essentially voiding their access to the entire command
					return hasPermission;
				}
			}
		}

		//Return true because the user didn't lack any permissions to use the command
		return true;
	}

	/**
	 * Retrieves a list any permissions that 
	 * the sender lacks
	 * @param msgSender The sender of the command
	 * @return <b>string[]</b> An array of all of the missing permissions by their flag name
	 */
	public getMissingPerms(msgSender:Discord.GuildMember):string[] {
		//Create an array to hold the missing permissions
		let missingPerms:string[] = [];

		//Loop over the list of permissions the command requires
		for(let permIndex in this.permsRequired){
			//Get the permission at the current index
			let curPerm:string = (this.permsRequired[permIndex]);

			//Check if the current permission is valid
			if(Discord.Permissions.FLAGS[curPerm]){
				//Check if the user possesses the current permission
				let hasPermission:boolean = (msgSender.hasPermission(Discord.Permissions.FLAGS[curPerm]));

				//Check if the user lacks the current permission
				if(!(hasPermission)){
					//Push the current permission string onto the missing permissions array
					missingPerms.push(curPerm);
				}
			}
		}

		//Return the filled missing permissions array
		return missingPerms;
	}

	/**
	 * Queues a message for deletion given a
	 * message object and the time in milliseconds
	 * it shall live
	 * @param message The message to queue for deletion
	 * @param millis The time in milliseconds that the message shall last
	 */
	public async queueDelete(message:Discord.Message|Discord.Message[], millis:number):Promise<void> {
		//Check if the message object is an array (https://stackoverflow.com/a/50523378)
		if((Array.isArray(message)) && (message.every(item => typeof item === "string"))){
			//Loop over every message object in the array
			for(let i in message){
				//Queue the current message for deletion
				await (this.deleteMsg(<Discord.Message> message[i], millis));
			}
		}
		else {
			//Queue the message for deletion
			await (this.deleteMsg(<Discord.Message> message, millis));
		}

		//Resolve the promise
		return Promise.resolve();
	}

	/**
	 * Queues an array of messages for deletion
	 * @param messageQueue The queue of messages to delete. Uses tuples, so the Pair class is required for this
	 */
	public async queueArrayDelete(messageQueue:Pair<Discord.Message|Discord.Message[], number>[]):Promise<void> {
		//Loop over every array element
		for(let i in messageQueue){
			//Pull out the variables from the pair
			let message:Discord.Message|Discord.Message[] = (messageQueue[i].getElemOne());
			let millis:number = (messageQueue[i].getElemTwo());

			//Queue the current message for deletion
			await (this.queueDelete(message, millis));
		}		

		//Resolve the promise
		return Promise.resolve();
	}

	/**
	 * Helper function for Command#queueDelete()
	 * and Command#queueArrayDelete() that deletes
	 * a message after x milliseconds
	 * @param message The message to delete
	 * @param millis The time the message shall live in milliseconds
	 */
	private async deleteMsg(message:Discord.Message, millis:number):Promise<void> {
		//Set a time based on the millis number then run the deletion function
		await AsyncUtil.delay(millis).then(async() => {
			//Delete the message
			await message.delete();

			//Report the deletion event to the console
			await (this.cmdConsole.out(`Deleted response message "${(message.embeds.length > 0) ? "<RICH EMBED>" : message.content}" from channel "#${(<Discord.TextChannel> message.channel).name}" in server "${message.guild.name}".`));
		});

		//Resolve the promise
		return Promise.resolve();
	}

	/**
	 * Checks if the sender has to wait before
	 * sending another command
	 * @param msgSender The user by ID trying to run the command
	 * @return <b>boolean</b> The status as to whether the user can execute the command or not
	 */
	public antiSpamAllowMsg(msgSender:Discord.GuildMember):boolean {
		//Set the required flags that the user needs
		const permFlags:string[] = ["MANAGE_MESSAGES", "MANAGE_CHANNELS", "MANAGE_GUILD"];

		//Check if the user has "manage messages", "manage channels", or "manage guild" permission
		if(this.hasReqPerms(msgSender, permFlags) || (this.spamTimeout <= 0)){
			//Return true because the user has no timeout restrictions
			return true;
		}

		//Check if the user isn't already in the timeout set
		if(!(this.timeoutSet.has(msgSender.id))){
			//Add the user's ID to the set
			this.timeoutSet.add(msgSender.id);

			//Queue the id to be deleted
			AsyncUtil.delay(this.spamTimeout).then(() => {
				//Delete the sender's entry after x milliseconds
    			this.timeoutSet.delete(msgSender.id);
			});

			//Return true because the user has permission to run the command
			return true;
		}
		else {
			//Return false because the user previously ran the command and the timeout hasn't expired
			return false;
		}
	}
}