import { bot } from '../index';
const config = require(`../../data/config.json`);

import {guildConfigurer} from '../modules/guildConfigCreator';
import { TextChannel } from 'discord.js';

let doxCheckingModule = require(`../modules/Antidox/antiDoxScreen`);

const fs = require(`fs`);

const Discord = require(`discord.js`);


bot.on(`guildCreate`, async guild => {

    let guildOwnerTemp = await bot.fetchUser(guild.ownerID);

		if(guild.id === "691833256055799829") return;
		
    if (fs.readFileSync(`./data/guilds/bannedGuilds.txt`).includes(guild.id) || fs.readFileSync(`./data/guilds/bannedGuildOwners.txt`).includes(guildOwnerTemp.id) || await doxCheckingModule.checkDox(guild.name)) {
        let loggingChannel = bot.channels.cache.get(bot.config.botChannels.guildLoggingChannelID) as TextChannel;
        if (loggingChannel) await loggingChannel.send(`:no_entry: There was an attempt to add me into the server **${guild.name}** [${guild.id}] but it was a blacklisted guild! Guild Owner: [${guildOwnerTemp.tag} [${guildOwnerTemp.id}] ]`);
        return guild.leave();
    } // If the guild is included in the banned guilds text file, automatically leave

    // Setup a guild config
    let configCreater = new guildConfigurer(guild.id);
    await configCreater.setupConfig(guild.id);

    /*
     * The following code for checking all of the guilds and creating their configuration was provided by my friend Kaimund600's GautamaBuddha (and Shibe) project and under the direct permission of Kaimund600#0600! 
     * The code for that (private) project is licensed under GPL-3.0 [https://www.gnu.org/licenses/gpl-3.0.en.html]
     * Please support Kaimund600 and his other projects on GitHub at https://github.com/Kaimund600
     * https://kaimund600.org
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
    if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}), (err) => {
        if (err) throw err;
    });
    if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
		



    let ownerFinal = await bot.fetchUser(guild.ownerID); // Fetch the guild owner
    console.log(`Joined a new guild: ${guild.name} (${guild.id}) owned by ${ownerFinal.tag}`);


    // Log this event into the hub server
    let joinEmbed = new Discord.RichEmbed()
        .setDescription(`~Joined Guild~`)
        .setColor(`#ffffff`)
        .setThumbnail(guild.iconURL)
        .addField(`Guild`, guild.name + ` with id ` + guild.id)
        .addField(`Owned By`, `${ownerFinal} (${ownerFinal.tag}) with id ${ownerFinal.id}`);

    let loggingChannel = bot.channels.cache.get(config.botChannels.guildLoggingChannelID) as TextChannel;
    if (loggingChannel) await loggingChannel.send(joinEmbed);

    // Send the guild owner a message
    await guild.owner.send(`${config.botName} has been added to your server **${guild.name}**. Be sure to check pulsar.severepain.xyz for information!`);


});