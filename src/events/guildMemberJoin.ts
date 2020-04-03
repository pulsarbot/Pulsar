import {bot} from '../index';
import * as Discord from 'discord.js';

let antiDoxModule = require(`../modules/Antidox/antiDoxScreen`);
const fs = require(`fs`);

const colors = {
  "darkRed": `750000`,
  "red": `ff0400`,
  "darkBlue": `000da7`,
  "blue": `00c5ff`,
  "purple": `bd00ff`,
  "lime": `1fff00`,
  "darkGreen": `007525`,
  "black": `000000`,
  "white": `ffffff`
};

bot.on(`guildMemberAdd`, async (member) => {

  let guild = member.guild;
  if (!guild) return;
  
if(guild.id === "691833256055799829") return;
		
  let guildOwner = await bot.fetchUser(member.guild.ownerID);
  let psGuild = await bot.pulsarGuilds.get(member.guild.id);

  // Import the configuration for the guild
  let guildConfig: any = psGuild.config;
  
  if(guildConfig.cguild){
  let cbannedusers = await JSON.parse(fs.readFileSync(`./data/community-bans.json`));

  if(cbannedusers[member.id] && member.bannable){
    let homeGuildReportChannel = await bot.channels.cache.get(bot.config.botWideActions) as Discord.TextChannel;
    homeGuildReportChannel.send(`:no_entry: Cbanned User ${member.user} (${member.user.tag}) [${member.id}] has tried to join the guild ${guild.name} [${guild.id}]! This guild has cbans: ${guildConfig.cguild}`);

    if(guildConfig.cguild){
      try {
        let reason = cbannedusers[member.id].reason || "No Reason Provided"
        member.guild.members.ban(member.id, {days: 1, reason: `Community Ban - ${reason}`})
      
        if(guildConfig.actionChannel){
          let guildActionChannel = await bot.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;
          guildActionChannel.send(`:no_entry: Auto-banned ${member.user} (${member.user.tag}) [${member.id}] - The user is community banned!`)
        }
      }
      catch {
        null
      }
    }
  }
  }
  
  if (fs.readFileSync(`./data/guilds/bannedGuilds.txt`).includes(member.guild.id)) {
      let loggingChannel = bot.channels.cache.get(bot.config.botChannels.guildLoggingChannelID) as Discord.TextChannel;
       if (loggingChannel) await loggingChannel.send(`:no_entry: There was an attempt to add me into the server **${guild.name}** [${guild.id}] but it was a blacklisted guild! Guild Owner: [${guildOwner.tag} [${guildOwner.id}] ]`);
      return member.guild.leave();
}

  if(member.guild.id == bot.config.OBHGuildID){
    let checkModule = require(`../modules/BHModules/blacklistedUserFilter`)
    await checkModule.checkBlacklistedMember(member)
  }


  // Guild Variables
  let isGuildDoxEnabled: any = guildConfig.doxEnabled;

  // Creating the rich embed for reporting
  let reportEmbed = new Discord.MessageEmbed()
  .setColor(`#${colors.black}`)
  .setThumbnail(member.guild.iconURL())
  .setAuthor(`Dox Event Occured - Username Dox`, member.user.displayAvatarURL())
  .addField(`User`, `<@${member.id}> (${member.user.tag}) [${member.id}]`)
  .addField(`User was banned`, `${(member.bannable && isGuildDoxEnabled).toString()}`)
  .addField(`Guild Has Antidox Enabled`, `${isGuildDoxEnabled.toString()}`)
  .addField(`Guild`, `${member.guild.name} [${member.guild.id}] (Owned By <@${guildOwner.id}> ${guildOwner.tag} [${guildOwner.id}])`)
  .addField(`Offending Username`, `|| ${member.user.tag} ||`)
  .setTimestamp()
  .setFooter(`${bot.config.botName} - Buddhism Hotline Antidox`);

  let masterGuildReportChannel = await bot.channels.cache.get(bot.config.botChannels.doxeventchannelid) as Discord.TextChannel;

  if (await antiDoxModule.checkDox(member.user.tag)) {
      await masterGuildReportChannel.send(reportEmbed);
      if(!bot.botAdmins.includes(member.id)){
        let loggingJson = JSON.parse(fs.readFileSync(`./data/doxEvents.json`).toString());
        // Push the event to the array
        loggingJson.push({"userID": member.id, "userTag": member.user.tag, "guildInfo": `${member.guild.name} [${member.guild.id}] (Owned By ${member.guild.owner.user.tag} [${member.guild.owner.user.id}])`, "User Bannable": member.bannable,  "username":`${member.user.username}`, "time": Date.now()});
        await fs.writeFileSync(`./data/doxEvents.json`, JSON.stringify(loggingJson, null, 4)); // Log to the file
    }
      if (guildConfig.doxEnabled && guildConfig.actionChannel) {
          await guild.members.ban(member.id, {
              reason: `Doxing - Bannable Username`,
              days: 1
          })
          let actionChannel = await bot.channels.cache.get(guildConfig.actionChannel) as Discord.TextChannel;
          await actionChannel.send(reportEmbed)
          return;
      } else if (guildConfig.doxEnabled && !guildConfig.actionChannel) {
          await guild.members.ban(member.id, {
              reason: `Doxing - Bannable Username`,
              days: 1
          })
          return;
      }
  }
  else {
    // If the user was previously muted, make sure they get their role back
    try {
      if(psGuild.muted_users[member.id]){
        let mutedRole = await member.guild.roles.cache.find(r => r.name === "Muted");
        await member.roles.add(mutedRole.id, "User was previously muted");
        await member.voice.setMute(true, "User was previously muted");
      }
      if(psGuild.image_muted_users[member.id]){
        let mutedRole = await member.guild.roles.cache.find(r => r.name === "Image Muted");
        await member.roles.add(mutedRole.id, "User was previously image muted");
      }
      if(psGuild.voice_muted_users[member.id]){
        let mutedRole = await member.guild.roles.cache.find(r => r.name === "Voice Muted");
        await member.roles.add(mutedRole.id, "User was previously voice muted");
        await member.voice.setMute(true, "User was previously voice muted");
      }
  }
  catch {
    null;
  }
  
    let newAccModule = require(`../modules/newAccountMonitor`)
    await newAccModule.accountMonitor(member)
  }


});
