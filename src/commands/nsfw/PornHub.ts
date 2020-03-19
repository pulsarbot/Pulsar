//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Axios from "axios";
import Discord, { TextChannel } from "discord.js";
import HTMLEntities from "he";
import Pornhub from "pornhub.js";

/**
 * Sends a random video from PornHub based 
 * on a given search term(s)
 * @author Spotlightsrule
 */
export default class PornHub extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"pornhub", //NAME
		"Sends a random video from PornHub based on a given search term(s)", //DESCRIPTION
		"pornhub [search term]", //USAGE - [] = MANDATORY () = OPTIONAL
		["pornhub [big butts]", "pornhub [icing on the cake]"], //EXAMPLES
		CommandCategory.NSFW, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["EMBED_LINKS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		3000, //SPAM TIMEOUT
		["hub", "ph"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "PornHub"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(PornHub.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Collect the arguments into a single string
		let searchTerm:string = (args.join(" "));

		//Create a new instance of the pornhub api class
		let pornHub = new Pornhub();

		//Search for the video on pornhub
		await pornHub.search('Video', searchTerm).then(async res => {
			//Get the amount of search results
			let resultsCount:number = res.data.length;

			//Pick a random number to stop at from 0 to the number of array elements
			let stoppingIndex:number = (MathUtil.getRandomInt(0, (resultsCount - 1)));

			//Create an object to hold the found video object
			let foundVideo:any = null;

			//Loop over the data
			for(let i=0; i<stoppingIndex; i++){
				//Get the current result
				let curResult:any = (await res.data[i]);

				//Check if the video is free
				if(!curResult.premium){
					//Set the found video to the current object
					foundVideo = curResult;
				}
				else if((curResult.premium) && (i <= stoppingIndex)){
					//Break out of the loop without saving the video (it's at the end of the list anyways)
					break;
				}
				else if((curResult.premium) && (i === 0)){
					//Set the stopping index to another random number and reset the counter back to 0
					stoppingIndex = (MathUtil.getRandomInt(0, (resultsCount - 1)));
					i = 0;
				}
			}

			//Get the video metadata
			let phVideoPage:string = (await PornHub.getPage(foundVideo.url));
			let videoMeta:any = (await PornHub.getVideoMeta(phVideoPage));

			//Try to get the link to the CDN
			let highestCDNLink:string = null;
			try {
				//Get the CDN link from the deobfuscated CDN JS payload
				highestCDNLink = (eval(await PornHub.getJSPayload(phVideoPage))); //Sketchy, I know, but it just werks
			}
			catch(error){
				//Set the CDN link to error because there was an error deobfuscating the URL
				highestCDNLink = "<Error fetching CDN link>";
			}

			//Construct an embed to send in the chat
			const phVideoEmbed:Discord.MessageEmbed = new Discord.MessageEmbed()
				.setColor("#ffa31a")
				.setThumbnail("https://cdn.pling.com/img/7/6/9/5/8a25783d7b5ad0df3ff91aca9e4768786570.jpg")
				.setAuthor("PornHub Fetch", "https://cdn.pling.com/img/7/6/9/5/8a25783d7b5ad0df3ff91aca9e4768786570.jpg", "https://pornhub.com")
				.setTitle(`${videoMeta.title}`)
				.setURL(`${foundVideo.url}`)
				.setDescription(`By: ${videoMeta.author}`)
				.addField("Uploaded on", `${videoMeta.uploaded}`)
				.addField("Duration", `${videoMeta.duration}`)
				.addField("Views", `${videoMeta.views}`, true)
				.addField("Likes", `${videoMeta.upvotes} :thumbsup:`, true)
				.addField("Dislikes", `${videoMeta.downvotes} :thumbsdown:`, true)
				.addField("Video Download Link (may 403 occasionally)", `${highestCDNLink}`)
				.setTimestamp()
				.setFooter(`Search Term: ${searchTerm}`, `${message.author.avatarURL()}`);

			//Send the message in chat and remove all tabs
			await message.channel.send(phVideoEmbed);
		});

		//End execution by resolving the promise
		return Promise.resolve(true);
	}

	//Private utilities
	/**
	 * Fetches the contents of a webpage
	 * using a GET request through Axios
	 * @param url The URL of the page to scrape
	 * @return <b>Promise<any></b> The contents of the webpage
	 */
	private static async getPage(url:string):Promise<any> {
		let htmlContent:any = null;

		//Issue a GET request to the pornhub video page
		await Axios(url).then(async response => {
			//Get the body of the page and unescape it
			htmlContent = (unescape(response.data));

			//Break out of the then block because NodeJS is rarted
			return;
		})
		.catch(async error => {
			//Log the error to the console
			console.log(error);

			//Break out of the then block because NodeJS is rarted
			return;
		});

		//Return the contents of the page
		return htmlContent;
	}

	/**
	 * Parses out a video's metadata from the
	 * contents of the origin webpage
	 * @param html The content of the video webpage
	 * @return <b>any</b> The parsed out video metadata (title:string, author:string, uploaded:string, duration:string, views:number, upvotes:number, downvotes:number)
	 */
	private static getVideoMeta(html:string):any {
		//Get the index of the metadata json object
		let metaPayloadStart:number = (html.indexOf("\<script type=\"application/ld+json\"\>"));

		//Get the metadata json object via lots of substring calls
		let metaJSON:any = JSON.parse(html.substring((metaPayloadStart + (html.substring(metaPayloadStart).indexOf("{"))), (metaPayloadStart + (html.substring(metaPayloadStart).indexOf("</script>")))));

		//Get the index of the ratings json object
		let ratingsPayloadStart:number = (html.indexOf("WIDGET_RATINGS_LIKE_FAV = "));

		//Get the ratings json object via lots of substring calls
		let ratingsJSON:any = JSON.parse(html.substring((ratingsPayloadStart + (html.substring(ratingsPayloadStart).indexOf("{"))), (ratingsPayloadStart + (html.substring(ratingsPayloadStart).indexOf(";")))));

		//Construct and return an object containing cherry-picked data from the two JSON objects
		return {
			title: HTMLEntities.decode(metaJSON.name), //THE NAME OF THE VIDEO
			author: ((typeof metaJSON.author !== 'undefined' && metaJSON.author !== null) ? metaJSON.author : "Anonymous"), //WHO UPLOADED THE VIDEO (ANONYMOUS IF THIS FIELD IS UNDEFINED)
			uploaded: new Date(metaJSON.uploadDate).toUTCString(), //WHEN THE VIDEO WAS UPLOADED
			duration: (metaJSON.duration.replace(/[PTS]/g, "").replace(/[HM]/g, ":")), //THE DURATION OF THE VIDEO
			views: parseInt(metaJSON.interactionStatistic[0].userInteractionCount.replace(/,/g, "")), //HOW MANY VIEWS THE VIDEO HAS
			upvotes: parseInt(ratingsJSON.currentUp), //THE AMOUNT OF LIKES ON THE VIDEO
			downvotes: parseInt(ratingsJSON.currentDown) //THE AMOUNT OF DISLIKES ON THE VIDEO
		};
	}

	/**
	 * Parses out a video's information from
	 * the contents of the origin webpage
	 * @param html The content of the video webpage
	 * @return <b>any</b> The parsed out carrier JSON object, containing the video info, minus the CDN URLs and main metadata
	 */
	private static getJSONCarrier(html:string):any {
		//Find the index of the video metadata
		let metaStartInd:number = (html.search("var flashvars_[0-9]{1,} = "));

		//Get the page contents string from the metadata start index
		let metaStart:string = (metaStartInd + html.substring(metaStartInd));

		//Trim the partial metadata string from the first parentheses to the first line ending to isolate the video metadata
		let metaPayload:string = (metaStart.substring(metaStart.indexOf("{"), (metaStart.indexOf(";\n"))));

		//Parse the JSON and return it
		return (JSON.parse(metaPayload));
	}

	/**
	 * Parses out a video's obfuscated JavaScript
	 * URL builder for the CDN links to the porn
	 * videos. Can be deobfuscated using eval(), 
	 * which will spit out the CDN URL to the highest
	 * quality video
	 * @param html The content of the video webpage
	 * @return <b>any</b> The parsed out obfuscated JavaScript string, containing a series of variables and other weird obfuscation maps
	 */
	private static getJSPayload(html:string):string {
		//Find the index of the javascript payload
		let jsStartInd:number = (html.search("var flashvars_[0-9]{1,} = "));

		//Get the page contents string from the JS start index
		let jsStart:string = (html.substring(jsStartInd));

		//Trim the partial JS string from the 0th position to the last possible line before errors occurred in testing
		let jsPayload:string = (jsStart.substring(0, (jsStart.indexOf("loadScriptUniqueId.push"))));

		//Return the isolated JS payload
		return (jsPayload);
	}
}