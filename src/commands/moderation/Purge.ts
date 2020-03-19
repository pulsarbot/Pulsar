//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Collection } from "discord.js";
import fs from 'fs';
import { parse } from "querystring";

export default class Purge extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"purge", //NAME
		"Remove a massive amount of messages from a channel", //DESCRIPTION
		"purge [number of messages] (@member/userID)", //USAGE - [] = MANDATORY () = OPTIONAL
		["purge [100] (@severepain#0001)", "purge [20]"], //EXAMPLES
		CommandCategory.MODERATION, //CATEGORY
		1, //MIN ARGS
		2, //MAX ARGS
		["MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		5000, //SPAM TIMEOUT
		["p", "prune", "delm"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "Test"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Purge.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length , message);
		
		//Check if the message type is direct
        if (message.channel.type !== "text") return message.author.send(":warning: This command may only be used on a server.");

        let botMember = await message.guild.members.cache.get(bot.user.id);
        if(!botMember.hasPermission("MANAGE_MESSAGES")){
            return message.reply(`:no_entry: I do not have permission to delete messages!`)
        }
		const m: Message = await message.channel.send(":hourglass: One moment, please... ") as Message;

		// No arguments
		if (!args[0]) return m.edit(`:information_source: The correct usage is: ${bot.config.prefix}${Purge.commandFields.usage}`);

        var memberToPurge: any;
        let purgeFromMember: boolean = false

        if(args[1]){
		    // Find Member
		    if(message.mentions.users.first()) memberToPurge = await message.guild.members.cache.get(message.mentions.users.first().id);
		    else memberToPurge = await message.guild.members.cache.get(args[1].replace(/[^\w\s]/gi, ''));

		    await memberToPurge
		    // Member Not Found
            if (!memberToPurge) return m.edit(`:no_entry: Couldn't find the member to purge messages from!`);
            else purgeFromMember = true;
        }

        if(!parseInt(args[0]) || parseInt(args[0]) > 500 || parseInt(args[0]) < 2){
            return m.edit(`:no_entry: The amount of messages to purge has to be lower than 500 and greater than 2!`);
        }

        m.delete();

        let numToPurge: number = parseInt(args[0]);

        let messagesInChannel: Collection<string, Message> = await message.channel.messages.fetch({limit: numToPurge + 1});

        if(purgeFromMember){
            messagesInChannel = await messagesInChannel.filter(m => m.author.id == memberToPurge.id);
        }

        let numOfMessagesFinal: number = messagesInChannel.size;

        // Actually delete the messages
        messagesInChannel.forEach(async msg => {
            try {
                await msg.delete();
            }
            catch {
                null;
            }
        })


        let psGuild = await bot.pulsarGuilds.get(message.guild.id);
        let guildConfig: any = psGuild.config;
        if(!guildConfig.actionChannel && message.member.hasPermission(`MANAGE_CHANNELS`)){
            let malert = await message.channel.send(`:bulb: I can log this if you assign a action channel.`) as Message;
            await malert.delete({timeout: 5000});
        }
        else {
            let actionChannel = await bot.channels.cache.get(guildConfig.actionChannel) as TextChannel;
            let chan = message.channel as TextChannel;

            let reportEmbed = new Discord.MessageEmbed()
            .setAuthor("Purge", message.author.displayAvatarURL())
            .setThumbnail(message.author.displayAvatarURL())
            .setColor("#ff7f00");
            if(memberToPurge && purgeFromMember){
            reportEmbed.addField("User To Purge From", `<@${memberToPurge.id}> (${memberToPurge.user.tag}) [${memberToPurge.id}]`);
            }
            reportEmbed.addField("Moderator", `<@${message.author.id}> (${message.author.tag})`);
            reportEmbed.addField("Channel", `<#${message.channel.id}> (#${chan.name}) [${message.channel.id}]`);
            reportEmbed.addField(`Number Of Messages`, `Deleted${parseInt(args[0]).toString()} messages!`)
            reportEmbed.setTimestamp();
            reportEmbed.setFooter(`ID: ${message.author.id}`);
            
            await actionChannel.send(reportEmbed);
        }

            return message.reply(`:white_check_mark: Deleted ${parseInt(args[0])} messages!`)

	}
}
