//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { MessageEmbed, VoiceChannel, GuildMember } from "discord.js";

/**
 * Generates a Discord screenshare link
 * for the voice channel that the sender
 * is currently in
 * @author Spotlightsrule
 */
export default class ScreenShare extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"screenshare", //NAME
		"Generates a Discord screenshare link for the voice channel that the sender is currently in", //DESCRIPTION
		"screenshare [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["screenshare [none]"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		0, //MIN ARGS
		0, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		5000, //SPAM TIMEOUT
		["ss", "sharescreen"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "ScreenShare"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(ScreenShare.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Get the user who initiated the command
		let targetUser:GuildMember = (message.member);
	
		//Check if the sender is in a VC
		if(targetUser.voice.channelID != null){
			//Get the ID of the server
			const serverID:string = (targetUser.guild.id);
		
			//Get the channel object of the VC that the the sender is in
			const vcObj:VoiceChannel = (targetUser.voice.channel);
		
			//Construct the screenshare link
			const ssLink:string = (`https://www.discordapp.com/channels/${serverID}/${vcObj.id}`);

			//Construct a MessageEmbed around the screenshare link
			const ssLinkEmbed:MessageEmbed = (new MessageEmbed()
				.setAuthor("Pulsar Screenshare", `${botClient.user.avatarURL()}`)
				.setColor("#7289da")
				.setTitle(`${ssLink}`)
				.setURL(`${ssLink}`)
				.setDescription(`:speaker: Voice Channel "${vcObj.name}" in guild "${targetUser.guild.name}"`)
				.addField("Listeners", `${vcObj.members.size}`, true)
				.addField("Quality", `${vcObj.bitrate.toString()}`, true)
				.setTimestamp()
				.setFooter(`Requested by: ${message.author.username}`, `${message.author.avatarURL()}`)
			);
		
			//Reply with the link to the VC's screenshare in a MessageEmbed
			await (message.reply(ssLinkEmbed));
		}
		else {
			//Warn that the user isn't in a VC
			await (message.reply(":x: This command can't be used because you are not in a VC."));
		}
		
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}