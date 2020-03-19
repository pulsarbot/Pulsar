//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import MD5 from "../../util/MD5";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Axios from 'axios';
import Discord, { Message } from "discord.js";
import SuperAgent from 'superagent';

export default class WebM extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"webm", //NAME
		"Sends a random webm from p90.zone (can return NSFW videos rarely)", //DESCRIPTION
		"webm [none]", //USAGE - [] = MANDATORY () = OPTIONAL
		["webm [none]"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
		0, //MIN ARGS
		0, //MAX ARGS
		["ATTACH_FILES", "EMBED_LINKS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		30000, //SPAM TIMEOUT
		["randomvideo", "webmvideo"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "CoinToss"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(WebM.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Set the URL for p90
		const p90URL:string = "https://p90.zone";

		if(!message.guild) return message.reply(`:warning: This command can only be used inside of a server!`);

		let self = await message.guild.members.cache.get(bot.user.id)
		if(self.hasPermission('EMBED_LINKS') == false || self.hasPermission('ATTACH_FILES') == false) return message.reply(`:x: I do not have permission to send images or embed links in this channel!`)
		if(!(<Discord.TextChannel> message.channel).nsfw) return message.reply(`:underage: Sorry, but "${WebM.commandFields.name}" sometimes generates NSFW results, so it is disallowed outside of NSFW-safe channels. Please try your input again in a text channel that allows NSFW content.`)
		
		//Attempt to fetch the video from p90.zone
		let videoHTTP:any = (await SuperAgent.get(p90URL).set("Cookie", await (MD5.md5(Math.random().toString()))));
		
		//Pull out the HTML contents from the object
		let p90Page:string = (videoHTTP.text);

		//If the p90 HTML document is null, break out and error
		if(p90Page === null) return (message.channel.send(":no_entry: There was an error fetching the video! Try again."));

		//Set the string to search for in the HTML data
		const cdnLinkMarker:string = "\"og:video\" content=\"";
	
		//Run the first substring round to get the video URL from the og:video meta tag at the beginning of the string
		let semiWebmLink:string = (p90Page.substring((p90Page.indexOf(cdnLinkMarker) + cdnLinkMarker.length)));

		//Run the second substring round to get the video URL on its own
		let webmLink:string = (semiWebmLink.substring(0, (semiWebmLink.indexOf('"'))));

		//If the webm link is null, break out and error
		if(webmLink === null) return (message.channel.send(":no_entry: There was an error fetching the video! Try again."));

		//Get the name of the webm by substringing to the last index of a forward slash
		const webmName:string = (webmLink.substring((webmLink.lastIndexOf("/") + 1), webmLink.length));

		//Get the size of the WEBM in bytes
		const webmSize:number = ((await Axios.get(webmLink)).data.length);

		//Check if the webm is above 8MB in size (Stupid file size limits)
		if(webmSize < 8000000){
			/* Until Discord allows videos in embeds, this will be disabled
			//Create a Discord embed object to send
			let webmEmbed:Discord.MessageEmbed = new Discord.MessageEmbed()
				.setColor("#000084")
				.setTitle("P90 WEBM Fetch")
				.setURL(p90URL)
				.addField((webmLink.substring((webmLink.lastIndexOf("/") + 1), webmLink.length)), webmLink)
				.setImage(webmLink)
				.setTimestamp()
				.setFooter(`Requested by: ${message.author.tag}`, `${message.author.avatarURL()}`);
			*/

			//Send the WEBM to the channel where the sender executed the command
			await message.channel.send(
				`Original video: \`${webmLink}\` \nSize: ~${MathUtil.getDataSize(webmSize, false, 2)}`, 
				{files: [{
					attachment: webmLink,
					name: webmName
				}]}
			);
		}
		else {
			//Send the link only
			await message.channel.send(`Original video: \`${webmLink}\` \nSize: ~${MathUtil.getDataSize(webmSize, false, 2)} \n<Video was too big to attach>`);
		}
	
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}