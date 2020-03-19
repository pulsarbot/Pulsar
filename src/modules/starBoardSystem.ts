import fs from 'fs';
import Discord, { GuildChannel, TextChannel, ReactionUserManager } from 'discord.js';
import Pulsar from '../handlers/Pulsar';

// test
module.exports = async function(bot: Pulsar): Promise<void>{

const STAR:string = `\u2B50`;

/*
bot.on('raw', packet => {
    // We don't want this to run on unrelated packets
    if (![`MESSAGE_REACTION_ADD`, `MESSAGE_REACTION_REMOVE`].includes(packet.t)) return;
    // Grab the channel to check the message from
    const channel = bot.channels.cache.get(packet.d.channel_id) as TextChannel;
    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.cache.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.messages.fetch(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.cache.get(emoji);
        // Adds the currently reacting user to the reaction's users collection.
        if (reaction) reaction.users.cache.set(packet.d.user_id, bot.users.cache.get(packet.d.user_id));
        // Check which type of event it is before emitting
        if (packet.t === `MESSAGE_REACTION_ADD`) {
            bot.emit(`messageReactionAdd`, reaction, bot.users.cache.get(packet.d.user_id));
        }
        if (packet.t === `MESSAGE_REACTION_REMOVE`) {
            bot.emit(`messageReactionRemove`, reaction, bot.users.cache.get(packet.d.user_id));
        }
    });
});
*/

bot.on(`messageReactionAdd`, async (reaction, user) => {
    if(!reaction ||! reaction.message) return;
	let message = reaction.message;


    let guildConfig = require(`../../data/guilds/${reaction.message.guild.id}/config.json`);

	if(!guildConfig) return;

	if(!guildConfig.starBoardChannel) return;
	if(!guildConfig.starsNeeded || guildConfig.starsNeeded == 0) return;

	let starsNeeded = guildConfig.starsNeeded;
	
    let starChannel = await message.guild.channels.cache.get(guildConfig.starBoardChannel) as TextChannel;
    if (message.channel === starChannel || message.author.id == bot.user.id) return;
    if(!starChannel) return; // If the server doesn't have a starboard, return

    if (reaction.emoji.name.toLowerCase() !== `star`) return; // If it's not a star, do nothing more.

    const fetch = await starChannel.messages.fetch({ limit: 100 }); 
    let stars = null;
    try {
        stars = await fetch.find(m => m.embeds[0].footer.text.startsWith(STAR) && m.embeds[0].footer.text.endsWith(message.id));
    } catch {
        null;
    }
    if (stars) {
		const starRegEx = new RegExp(`/^${STAR}\s([0-${starsNeeded.toString()}]{1,3})\s\•\sID:\s([0-9]{17,20})/`);
		let star = starRegEx.exec(stars.embeds[0].footer.text);
        const foundStar = stars.embeds[0];
        const image = message.attachments.size > 0 ? await message.attachments.first().url : ``; 
        let embed = new Discord.MessageEmbed()
          .setColor(foundStar.color)
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setTimestamp(message.createdAt)
          .setFooter(STAR + ` ${parseInt(star[1])+1} • ID: ${message.id}`)
          .setImage(image);
        if (foundStar.description) await embed.setDescription(foundStar.description);
        const starMsg = await starChannel.messages.fetch(stars.id);
        await starMsg.edit({ embed }); 
    } else {
        if (!reaction.count < starsNeeded){ 
        const image = message.attachments.size > 0 ? await message.attachments.first().url : ``; 
        const embed = new Discord.MessageEmbed()
        .setColor(15844367)
        .setDescription(message.cleanContent)  // Test
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp(message.createdAt)
        .setFooter(STAR + ` ${starsNeeded} • ID: ${message.id}`)
        .setImage(image);
        await starChannel.send({ embed });
    }
    else return; // Don't do anything if the number of stars is below the board's threshold
    }
});

};