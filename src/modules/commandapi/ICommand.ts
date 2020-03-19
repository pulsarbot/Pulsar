//Import first-party classes
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from 'discord.js';

/**
 * Defines a command class as runnable
 * by the command interpreter
 * @author Spotlightsrule
 */
export default interface ICommand {
	/**
	 * Runs the main payload of the command 
	 * class that implements this interface.
	 * IMPORTANT: To maintain asynchronous
	 * flow, this function should be made
	 * async in all implemented command 
	 * subclasses
	 * @param botClient The instance of the bot client
	 * @param message The message object that the sender used to call the command
	 * @param args The arguments for the command, not including the prefix or the command name
	 * @param calledName The name that the command was called by (can be either the command's name or an alias)
	 * @return </b>Promise<T></b> The status as to whether the command executed successfully or not
	 */
	run<T>(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<T>;
}