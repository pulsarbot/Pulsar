import { bot, cmdInterpreter } from '../index';
const config = require(`../../data/config.json`);
import Spliterator from '../util/Spliterator';
import StringUtil from '../util/StringUtil';
let fs = require(`fs`);
let antiDoxEvents = require(`../modules/Antidox/antiDoxEvents`);
import { guildConfigurer } from '../modules/guildConfigCreator';
import { TextChannel, MessageReaction, DiscordAPIError, Message } from 'discord.js';

	// On the message being sent
	bot.on(`message`, async (message: Message) => {
		if (!message.guild) return;
		if (message.channel.type === `dm`) return;
	
		let guild = message.guild;
		let guildOwnerTemp = await bot.fetchUser(message.guild.ownerID);

		if (config.antiDoxEnabled && !message.author.bot && message.author.id !== bot.user.id) { // Yeah rule #1 when dealing with an auto-dox system: **do not let the bot ban itself** - Kaimund600
			//Try to check for a dox event
			try {
				await antiDoxEvents.messageAntiDox(message); // Check the message for a dox
				await antiDoxEvents.messageBlacklisted(message); // Check if the message contains blacklisted content
			}
			catch(error){
				console.log(`[ERROR] [ANTIDOX] AN ERROR OCCURRED WHILE CHECKING FOR DOXXES: ${error}`)
			}
		}
		
		if (message.author.bot) return;

		// Checking if the guild has been banned
		if (fs.readFileSync(`./data/guilds/bannedGuilds.txt`).includes(message.guild.id) && !message.content.includes(`:no_entry: **This guild has been banned.**`)) {
			await message.channel.send(`:no_entry: **This guild has been banned.**`);
			let loggingChannel = bot.channels.cache.get(bot.config.botChannels.guildLoggingChannelID) as TextChannel;
	   		if (loggingChannel) await loggingChannel.send(`:no_entry: There was an attempt to add me into the server **${guild.name}** [${guild.id}] but it was a blacklisted guild! Guild Owner: [${guildOwnerTemp.tag} [${guildOwnerTemp.id}] ]`);
			return message.guild.leave();
		}
		
		// Checking if the guild is owned by a banned guild owner
		if (fs.readFileSync(`./data/guilds/bannedGuildOwners.txt`).includes(message.author.id) && !message.content.includes(`:no_entry: **This guild has been banned.**`) && message.author.id == message.guild.ownerID) {
			await message.channel.send(`:no_entry: **This guild has been banned.**`);
			let loggingChannel = bot.channels.cache.get(bot.config.botChannels.guildLoggingChannelID) as TextChannel;
			if (loggingChannel) await loggingChannel.send(`:no_entry: There was an attempt to add me into the server **${guild.name}** [${guild.id}] but it was a blacklisted guild! Guild Owner: [${guildOwnerTemp.tag} [${guildOwnerTemp.id}] ]`);
			return message.guild.leave();
		}



		await guildConfigurer.prototype.setupConfig(guild.id);

   		/*
	 	 * The following code for checking all of the guilds and creating their configuration was provided by my friend Kaimund600's GautamaBuddha (and Shibe) project and under the direct permission of Kaimund600#0600! 
	 	 * The code for that (private) project is licensed under GPL-3.0 [https://www.gnu.org/licenses/gpl-3.0.en.html]
	 	 * Please support Kaimund600 and his other projects on GitHub at https://github.com/Kaimund600
	 	 * https://kaimund600.org
	 	 * 
	 	*/
		if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}), (err) => {
			if (err) throw err;
		});
		if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}), (err) => {
			if (err) throw err;
		});
   		if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}), (err) => {
			if (err) throw err;
		});
		if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}), (err) => {
			if (err) throw err;
		});
		if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
        if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
		

		//Get the prefixes
		let prefix:string = config.prefix;
		let buddhaPrefix:string = "buddha ";

		//Get the contents of the message
		let msgCont:string = (message.content.toLowerCase());

		//Set the whitelisted commands for OBH
		//TODO: Check if the user has embed perms instead for the channel
		let obhGeneral:string = "453053508858675202";
		let whitelistedCmds:string[] = ["stats", "level", "top"];

		//Check if a valid command prefix was passed
		if(msgCont.startsWith(prefix.toLowerCase())){
			//Split the incoming command using the spliterator
			let messageArgs:string[] = (await Spliterator.split(message.content));

			//Check if the message args begins with the configured prefix
			if(msgCont.startsWith(prefix.toLowerCase())){
				//Slice the prefix out of the first array element
				messageArgs[0] = (await messageArgs[0].slice(prefix.length));
			}
			else {
				//Slice the first array element entirely
				messageArgs = (await messageArgs.slice(1, (messageArgs.length)));
			}

			//Get the base command
			let baseCommand:string = messageArgs[0];

			//Only allow certain commands inside of the #general channel of OBH
			if(message.channel.id == obhGeneral && !message.member.hasPermission(`MANAGE_MESSAGES`) && !StringUtil.equalsAny(msgCont, whitelistedCmds, true)){
				return message.reply(`:x: Bot Commands are disabled in this channel! Please use <#451364770872819735> or <#453079493322473472>`);
			}
			
			//Pass the command arguments to the interpreter
			await cmdInterpreter.execute(message, messageArgs);
		}
		// End Event
	});


	bot.on(`messageUpdate`, async function(oldMessage, newMessage) {
		let message = newMessage;

		if (message.author.bot) return;
		if (message.channel.type === `dm`) return;

   		if (!message.guild.id) return;

		if (config.antiDoxEnabled) {
			//Try to check for a dox event
			try {
				await antiDoxEvents.messageAntiDox(message); // Check the message for a dox
				await antiDoxEvents.messageBlacklisted(message); // Check if the message contains blacklisted content
			}
			catch(error){
				console.log(`[ERROR] [ANTIDOX] WARNING! AN ERROR OCCURRED WHILE CHECKING FOR DOXXES: ${error}`)
			}
		}
	});
