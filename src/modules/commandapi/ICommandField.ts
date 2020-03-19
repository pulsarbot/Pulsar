//Import first-party classes
import { CommandCategory } from "./CommandCategory";

/**
 * Defines the value fields for a
 * command class
 * @author Spotlightsrule
 */
export default interface ICommandField {
	//Set implementable variables
	/**
	 * Defines the name of the command
	 */
	name:string;

	/**
	 * Defines what the command will do
	 */
	description:string;

	/**
	 * Defines the usage syntax of the command, 
	 * where values enclosed in [] are mandatory 
	 * and values enclosed in () are optional
	 */
	usage:string;

	/**
	 * Defines examples of how the command
	 * can be used
	 */
	examples:string[];

	/**
	 * Defines the category that the command
	 * best fits into. The following categories
	 * are available:
	 * <ul>
	 *  <li>administration</li>
	 *  <li>core</li>
	 *  <li>custom</li>
	 *  <li>fun</li>
	 *  <li>miscellaneous</li>
	 *  <li>moderation</li>
	 *  <li>utility</li>
	 * </ul>
	 */
	category:CommandCategory;

	/**
	 * Sets the minimum number of arguments
	 * that must be passed to the command. Set
	 * this value 0 or -1 to remove the cap
	 */
	minArgs:number;

	/**
	 * Sets the maximum number of arguments
	 * that must be passed to the command. Set
	 * this value to -1 to remove the cap
	 */
	maxArgs:number;

	/**
	 * Sets the required permission flags
	 * the command caller must posses in
	 * order to use the command
	 * @see https://discordapp.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
	 */
	permsRequired:string[];

	/**
	 * Locks down a command such that only the 
	 * bot owner can use it. Good for commands
	 * that are meant for internal debugging
	 * of the bot client
	 * @see trustedOnly
	 */
	ownerOnly:boolean;

	/**
	 * Locks down a command such that only the 
	 * bot owner or approved administrators can
	 * use it. Good for commands that can apply
	 * multiple servers such as global bans
	 * @see ownerOnly
	 */
	trustedOnly:boolean;

	/**
	 * Prevents users in this list from executing 
	 * the command
	 */
	blacklistedUsers:string[];

	/**
	 * Allows only the guilds in this list to 
	 * execute the command
	 */
	whitelistedGuilds:string[];

	/**
	 * Sets whether or not the command sender's
	 * message should be deleted after the command
	 * finishes executing
	 */
	deleteOnFinish:boolean;

	/**
	 * Sets whether or not the command should
	 * signal in chat that the bot is typing 
	 * something out
	 */
	simulateTyping:boolean;

	/**
	 * The time in milliseconds that a user must
	 * wait before using the command again. Senders
	 * with "manage messages", "manage channels", or 
	 * "manage guild" permissions can bypass this 
	 * restriction
	 */
	spamTimeout:number;

	/**
	 * OPTIONAL: Defines other names that the 
	 * command can be called by. Otherwise, 
	 * what are alternate names that the user 
	 * can call the command with?
	 */
	aliases?:string[];
}
/**
 * Organizes the command fields into a
 * single class
 * @author Spotlightsrule
 */
export class CommandField implements ICommandField {
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

	/**
	 * Constructs a new command field instance
	 * @constructor
	 * @param name The name of the command
	 * @param description What the command does
	 * @param usage The syntax for the command where [] is mandatory and () is optional
	 * @param examples Examples of command usage
	 * @param category The category of the command
	 * @param minArgs The minimum argument count that must be passed
	 * @param maxArgs The maximum argument count that must be passed
	 * @param permsRequired The required permissions a user must possess in order to run the command
	 * @param ownerOnly Locks down the command to the bot owner only
	 * @param trustedOnly Locks down the command to trusted admins and the bot owner only
	 * @param blacklistedUsers Prevents people in the list from using the command
	 * @param whitelistedGuilds Prevents all but approved guilds in the list from using the command
	 * @param deleteOnFinish Delete the sender's command call when the command execution finishes
	 * @param simulateTyping Sets whether or not typing statuses should be sent
	 * @param spamTimeout Prevents users from running a command more than once in x milliseconds
	 * @param aliases OPTIONAL: Alternative names that the command can be called by
	 */
	constructor(name:string, description:string, usage:string, examples:string[], category:CommandCategory, minArgs:number, maxArgs:number, permsRequired:string[], ownerOnly:boolean, trustedOnly:boolean, blacklistedUsers:string[], whitelistedGuilds:string[], deleteOnFinish:boolean, simulateTyping:boolean, spamTimeout:number, aliases?:string[]){
		//Assign the command fields
		this.name = name;
		this.description = description;
		this.usage = usage;
		this.examples = examples;
		this.category = category;
		this.minArgs = minArgs;
		this.maxArgs = maxArgs;
		this.permsRequired = permsRequired;
		this.ownerOnly = ownerOnly;
		this.trustedOnly = trustedOnly;
		this.blacklistedUsers = blacklistedUsers;
		this.whitelistedGuilds = whitelistedGuilds;
		this.deleteOnFinish = deleteOnFinish;
		this.simulateTyping = simulateTyping;
		this.spamTimeout = spamTimeout;
		this.aliases = aliases;
	}
}