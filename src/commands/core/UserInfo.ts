//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

import MathUtil from '../../util/MathUtil';
import AsyncUtil from '../../util/AsyncUtil';

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, User, MessageEmbed, Guild} from "discord.js";
import fs from 'fs';
import PulsarGuild from "../../handlers/PulsarGuild";

export default class UserInfo extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"uinfo", //NAME
		"Gets the information of a user", //DESCRIPTION
		"uinfo (userID)", //USAGE - [] = MANDATORY () = OPTIONAL
		["uinfo 13267567124", "uinfo"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		0, //MIN ARGS
		1, //MAX ARGS
		[], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		false, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["userinfo"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(UserInfo.commandFields, cmdConsole);
	}

    // Messy Code imported from a selfbot I made a while back. I only TSifyed it
	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {

        super.assertArgCount(args.length , message);
        let userForInfo: User
        if(args[0]){
            if(await bot.fetchUser(args[0].replace(/[^\w\s]/gi, ''))) userForInfo = await bot.users.cache.get(args[0].replace(/[^\w\s]/gi, ''));
            else return message.reply(`:no_entry: The user ID you provided is invalid or the bot doesn't have that user cached!`);
        }
        else {
            userForInfo = message.author;
        }

        let sharedGuilds: string[] = [];

        let i = 0;
        await AsyncUtil.asyncForEach(await Array.from(bot.guilds.cache.values()), async pulsarGuild => {    
            if(i > 10) return;
            let psGuild: Guild = await bot.guilds.cache.get(pulsarGuild.id);
            if(await psGuild.members.cache.get(userForInfo.id)) sharedGuilds.push(`${psGuild.name} [${psGuild.id}]`);
            i++
        });

        let user: Discord.User = userForInfo;

        let accountAgeMs = (Date.now() - user.createdTimestamp);

        let accountAge = await MathUtil.msToDHMS(accountAgeMs);

        const date = user.createdAt;
        const newDate = date.toLocaleDateString();

        let extraTag = "";
        if(bot.owner == user.id) extraTag = "[BOT OWNER]"
        else if(bot.botAdmins.includes(user.id)) extraTag = "[BOT ADMIN]"

        let infoEmbed = new Discord.MessageEmbed()
        .setAuthor(`User info - ${user.tag} (${user.id}) ${extraTag || ''}`, message.author.displayAvatarURL())
        .setColor("#000000")
        .setThumbnail(user.displayAvatarURL())
        .addField("User", ` ${user} (${user.tag})`); 
        if(user.id !== bot.user.id){infoEmbed.addField("Shared Guilds", `${sharedGuilds.join(`, `) || `No Shared Guilds`}`)}
        infoEmbed.addField('Account Age', `${accountAge.day} days, ${accountAge.hours} hours, ${accountAge.minutes} minutes, and ${accountAge.seconds} seconds old`)
        infoEmbed.addField('Account Creation Date', `${newDate}`)
        if(message.guild && await message.guild.members.cache.get(user.id)){
            let userMember = await message.guild.members.cache.get(user.id)
            let roleArray = []

            userMember.roles.cache.forEach(async role =>{
                if(role.name == "@everyone" || role.managed) return;
                roleArray.push(`<@&${role.id}>`)
            })

            if(roleArray){
            infoEmbed.addField('Server Roles', `${roleArray.join(`, `)}`);
            }

        }
        infoEmbed.setTimestamp();
        infoEmbed.setFooter(`User Lookup - ${message.author.tag}`);

        try{
            message.channel.send(infoEmbed)
            }
        catch{
            await message.channel.send(`:no_entry: Embeds are not supported in this channel!`)
        }
    }

    

}
