//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

import MathUtil from '../../util/MathUtil';
import AsyncUtil from '../../util/AsyncUtil';

//Import core Node modules and dependencies
import Discord, { TextChannel, Message, Guild, GuildMember, User } from "discord.js";
import fs from 'fs';

export default class GuildInfo extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"ginfo", //NAME
		"Gets the information of a guild", //DESCRIPTION
		"ginfo (guildID)", //USAGE - [] = MANDATORY () = OPTIONAL
		["ginfo 13267567124", "ginfo"], //EXAMPLES
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
		["guildinfo"] //ALIASES
	);

	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(GuildInfo.commandFields, cmdConsole);
	}

    // Messy Code imported from a selfbot I made a while back. I only TSifyed it
	public async run(bot:Pulsar, sourceMessage:Discord.Message, args:string[], calledName:string):Promise<any> {
        //Assert the argument count	
        super.assertArgCount(args.length , sourceMessage);
        
        let guild: Discord.Guild;
        let message = await sourceMessage.channel.send(`:hourglass: Please wait...`);
        if(args[0]){
            if(await bot.pulsarGuilds.get(args[0])){
                guild = await bot.pulsarGuilds.get(args[0])
            }
            else{ 
                await message.edit(`:no_entry: The guild ID you provided is invalid! Please make sure this bot is inside of the guild!`)
                return;
            }
        }
        else guild = message.guild;
    
        if(!guild && message.guild){
            guild = message.guild
        }
        else if (!guild &&! message.guild){
            await message.edit(`:no_entry: This command can only be used if you supply a guild ID or in a guild!`)
            
            return;
        }
    
   let accountAgeMs = (Date.now() - guild.createdTimestamp);
    
   let accountAge = await MathUtil.msToDHMS(accountAgeMs);
    
    const date = guild.createdAt;
    const newDate = date.toLocaleDateString();
    
    
    let guildOwner: User = await bot.fetchUser(guild.ownerID);
    let guildAdmins: string[] = [];
    let guildMods: string[] = [];
    
    guild.members.cache.forEach(function(member){
    
        if(member.hasPermission("ADMINISTRATOR") &&! member.user.bot){
            
            if(member.user.id == guildOwner.id) return;
    
            guildAdmins.push(`${member.user.tag}`)
            }
        
        if(member.hasPermission("BAN_MEMBERS") &&! member.hasPermission("ADMINISTRATOR") &&! member.user.bot){
    
            if(member.user.id == guildOwner.id) return;
    
                guildMods.push(`${member.user.tag}`)
                }
        })
    
        let infoEmbed = new Discord.MessageEmbed()
        .setAuthor(`Guild info - ${guild.name} (${guild.id})`, message.author.displayAvatarURL())
        .setColor("#000000")
        .setThumbnail(guild.iconURL())
        .addField("Guild", ` ${guild.name} (${guild.id})`);
        infoEmbed.addField('Guild Age', `${accountAge.day} days, ${accountAge.hours} hours, ${accountAge.minutes} minutes, and ${accountAge.seconds} seconds old`)
        infoEmbed.addField('Guild Creation Date', `${newDate}`)
        infoEmbed.addField("Guild Owner", ` ${guildOwner} (${guildOwner.tag} [ID: ${guildOwner.id}])`)
        infoEmbed.addField("Guild Administrators (PERM: Administrator)", `${guildAdmins.join(`, `) || "None Listed"}`)
        infoEmbed.addField("Guild Moderators (PERM: Ban Members)", `${guildMods.join(`, `) || "None Listed"}`)
        if(guild.roles){
    
            let roleArray = []
    
            guild.roles.cache.forEach(async role =>{
                if(role.name == "@everyone" || role.managed) return;
                roleArray.push(`<@&${role.id}>`)
            })
    
            if(roleArray){
            infoEmbed.addField('Roles', `${roleArray.join(`, `)}`)
            }
    
        }
        infoEmbed.setTimestamp()
        infoEmbed.setFooter(`Guild Lookup - ${sourceMessage.author.tag}`);
    
        try{
            await message.channel.send(infoEmbed)
            message.delete()
        }
        catch{
            await message.edit(`:no_entry: Embeds are not supported in this channel!`)
        }
    
    
}

}
