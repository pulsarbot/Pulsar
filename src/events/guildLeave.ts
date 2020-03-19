import * as Discord from 'discord.js';
import { bot } from '../index';
const config = require(`../../data/config.json`);




bot.on(`guildDelete`, async guild => {
    // Delete the pulsarguild
    await bot.pulsarGuilds.delete(guild.id);
    
    // Log the event
    let ownerFinal = await bot.fetchUser(guild.ownerID) as Discord.User;

    let joinEmbed = new Discord.MessageEmbed()
        .setDescription(`~Left Guild~`)
        .setColor(`#000000`)
        .setThumbnail(guild.iconURL())
        .addField(`Guild`, guild.name + ` with id ` + guild.id)
        .addField(`Owned By`, `${ownerFinal} (${ownerFinal.tag}) with id ${ownerFinal.id}`);


   let reportChannel = await bot.channels.cache.get(config.botChannels.guildLoggingChannelID) as Discord.TextChannel;
   reportChannel.send(joinEmbed);



});
