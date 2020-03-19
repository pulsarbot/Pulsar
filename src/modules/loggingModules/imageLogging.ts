import { TextChannel } from "discord.js";
import * as fs from 'fs';
import * as Discord from 'discord.js';
import Pulsar from "../../handlers/Pulsar";

module.exports = async function(bot: Pulsar): Promise<void> {

    const colors = {
        "darkRed": `750000`,
        "red": `ff0400`,
        "darkBlue": `000da7`,
        "blue": `00c5ff`,
        "purple": `bd00ff`,
        "lime": `1fff00`,
        "darkGreen": `007525`
    };

    bot.on(`message`, async (message) => {

        if(!message.attachments) return;
        if(!message.guild) return;
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${message.guild.id}/config.json`).toString());

        if(guildConfig.imageLogChannel){

            message.attachments.forEach(async attachment => {
                let imageEmbed = new Discord.MessageEmbed()
                .setAuthor(`${message.author.tag} [${message.author.id}]`, message.author.avatarURL())
                .setColor(`#` + colors.purple)
                .setImage(attachment.url)
                .addField(attachment.name, attachment.url)
                .setTimestamp()
                .setFooter(`#${(<Discord.TextChannel> message.channel).name} [${message.channel.id}] - ${message.guild.name}`, message.guild.iconURL());

                let imgLogChann = await bot.channels.cache.get(guildConfig.imageLogChannel) as TextChannel;
                imgLogChann.send(imageEmbed);
            });

        }


    });

    





};