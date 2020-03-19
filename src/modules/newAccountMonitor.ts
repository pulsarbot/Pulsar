import fs from 'fs'
import { GuildMember, TextChannel } from 'discord.js';

async function accountMonitor(member: GuildMember) {

    if (!member) return;

    let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${member.guild.id}/config.json`, 'utf8'));

    if (!guildConfig.reportNewAcc) return;

    let reportChannel = member.guild.channels.cache.get(guildConfig.reportChannel) as TextChannel;

    if (!reportChannel) return;

    let convertMS = function(millis){
		let day:number, hour:number, minute:number, seconds:number;
		seconds = Math.floor(millis / 1000);
		minute = Math.floor(seconds / 60);
		seconds = seconds % 60;
		hour = Math.floor(minute / 60);
		minute = minute % 60;
		day = Math.floor(hour / 24);
		hour = hour % 24;
		
		//Construct and return a new object containing the times
		return {
			day: day,
			hour: hour,
			minute: minute,
			seconds: seconds
		};
}

    let accountAgeMs = (Date.now() - member.user.createdTimestamp);

    let accountAge = await convertMS(accountAgeMs);

    if (member.user.createdTimestamp >= (Date.now() - 604800000)) { // If the user is older than x days

        await reportChannel.send(`:warning: **Recently Created Account Join:** <@${member.id}> (${member.user.tag} [ID: ${member.user.id}]) - ${accountAge.day} days, ${accountAge.hour} hours, ${accountAge.minute} minutes, and ${accountAge.seconds} seconds old.`); // Report it

        return;
    }


}

module.exports.accountMonitor = accountMonitor
