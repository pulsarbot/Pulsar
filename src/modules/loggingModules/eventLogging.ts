import * as fs from 'fs';
import * as Discord from 'discord.js';
import Pulsar from '../../handlers/Pulsar';


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

    let vclogs = `583083703337746432`;
    let obh = `451248270409334796`;
    let obhGuild = await bot.guilds.cache.get(obh);

    bot.on(`guildBanAdd`, async (guild, user) => {
        let banAddEmbed = new Discord.MessageEmbed()
            .setAuthor(`Member Banned`, user.displayAvatarURL())
            .setColor(`#` + colors.darkRed)
            .addField(`User`, `<@${user.id}> (${user.tag})`)
            .setTimestamp()
            .setFooter(`USER ID: ${user.id}`);

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${guild.id}/config.json`, `utf8`));
        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(banAddEmbed);
        }
    });


    bot.on(`guildBanRemove`, async (guild, user) => {
        let banRemoveEmbed = new Discord.MessageEmbed()
            .setAuthor(`Member Unbanned`, user.displayAvatarURL())
            .setColor(`#` + colors.blue)
            .addField(`User`, `<@${user.id}> (${user.tag})`)
            .setTimestamp()
            .setFooter(`USER ID: ${user.id}`);
        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${guild.id}/config.json`, `utf8`));
        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(banRemoveEmbed);
        }
    });

    bot.on(`messageDelete`, async (message) => {


        let messageDelete = new Discord.MessageEmbed()
            .setAuthor(`Message Deleted`, message.author.displayAvatarURL())
            .setColor(`#` + colors.red)
            .addField(`User`, `<@${message.author.id}> (${message.author.tag})`)
            .addField(`Channel`, `${message.channel} (#${(<Discord.TextChannel>message.channel).name})`);
        if (message.content && message.content.length < 1000) {
            messageDelete.addField(`Message`, `${message.content}`);
        }
        if (message.attachments) {
            message.attachments.forEach(element => {
                messageDelete.addField(`Message Attachment`, element.url);
            });

        }
        messageDelete.setTimestamp();
        messageDelete.setFooter(`USER ID: ${message.author.id}`);

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${message.guild.id}/config.json`, `utf8`));
        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(messageDelete);
        }




    });

    bot.on(`messageUpdate`, async (oldMessage, newMessage) => {

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${oldMessage.guild.id}/config.json`, `utf8`));

        let message = newMessage;

        if (message.author.bot) return;
        if (oldMessage.content == newMessage.content || !message.content || message.content == `` || message.content == `\n`) return;

            let ogChannelText = message.channel as Discord.TextChannel;

        let messageEdit = new Discord.MessageEmbed()
            .setAuthor(`Message Edited`, message.author.displayAvatarURL())
            .setColor(`#` + colors.blue)
            .setTitle(`Jump to message`)
            .setURL(`${message.url}`)
            .addField(`User`, `<@${message.author.id}> (${message.author.tag})`)
            .addField(`Channel`, `${message.channel} (#${ogChannelText.name})`);
        if (oldMessage.content) {
            messageEdit.addField(`Before`, `${oldMessage.content}.`);
        }
        if (message.content) {
            messageEdit.addField(`After`, `${message.content}`);
        }
        messageEdit.setTimestamp();
        messageEdit.setFooter(`USER ID: ${message.author.id}`);

        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(messageEdit);
        }

    });

    bot.on(`guildMemberUpdate`, async (oldMember, newMember) => {
        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${oldMember.guild.id}/config.json`, `utf8`));

        let member = newMember;

        if (member.nickname == oldMember.nickname) return;


        if (member.nickname) {

            if (oldMember.nickname) {
                let nickname = new Discord.MessageEmbed()
                    .setAuthor(`Member Changed Nickname`, member.user.displayAvatarURL())
                    .setColor(`#` + colors.blue)
                    .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
                    .addField(`Before`, `${oldMember.nickname}`)
                    .addField(`After`, `${member.nickname}`)
                    .setTimestamp()
                    .setFooter(`USER ID: ${member.user.id}`);

                if (guildConfig.logChannel) {
                    (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(nickname);
                }
                return;
            }

            if (!oldMember.nickname) {

                let nooldnickname = new Discord.MessageEmbed()
                    .setAuthor(`Member Set Nickname`, member.user.displayAvatarURL())
                    .setColor(`#` + colors.lime)
                    .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
                    .addField(`Nickname`, `${member.nickname}`)
                    .setTimestamp()
                    .setFooter(`USER ID: ${member.user.id}`);

                if (guildConfig.logChannel) {
                    (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(nooldnickname);
                }


                return;
            }

        }

        if (!member.nickname) {
            let noNick = new Discord.MessageEmbed()
                .setAuthor(`Member Removed Nickname`, member.user.displayAvatarURL())
                .setColor(`#` + colors.red)
                .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
                .addField(`Before`, `${oldMember.nickname}`)
                .addField(`After`, `None!`)
                .setTimestamp()
                .setFooter(`USER ID: ${member.user.id}`);
                
            if (guildConfig.logChannel) {
                (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(noNick);
            }
        }
    });

    bot.on(`guildMemberAdd`, async (member) => {



        let memberJoin = new Discord.MessageEmbed()
            .setAuthor(`Member Joined`, member.user.displayAvatarURL())
            .setColor(`#` + colors.lime)
            .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
            .setTimestamp()
            .setFooter(`USER ID: ${member.user.id}`);

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${member.guild.id}/config.json`, `utf8`));

        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(memberJoin);
        }
        return;

    });


    bot.on(`guildMemberRemove`, async (member) => {

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${member.guild.id}/config.json`, `utf8`));

        let memberLeave = new Discord.MessageEmbed()
            .setAuthor(`Member Left`, member.user.displayAvatarURL())
            .setColor(`#` + colors.red)
            .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
            .setTimestamp()
            .setFooter(`USER ID: ${member.user.id}`);

        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(memberLeave);
        }
        return;

    });


    // OBH-Only Feature

    bot.on(`voiceStateUpdate`, async (oldMember, newMember) => {

        let member = newMember.member;

        if (member.guild.id !== obh) return;
        if (oldMember.guild.id !== obh) return;
        if (member.guild.id == obh) {
            if (!member.voice.channel && oldMember.channel) {
                let memberVCLeave = new Discord.MessageEmbed()
                    .setAuthor(`Member Left Voice Channel`, member.user.displayAvatarURL())
                    .setColor(`#` + colors.red)
                    .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
                    .addField(`Voice Channel`, `#${oldMember.channel.name}`)
                    .setTimestamp()
                    .setFooter(`USER ID: ${member.user.id}`);

                (<Discord.TextChannel>bot.channels.cache.get(vclogs)).send(memberVCLeave);
                return;
            }

            if (oldMember.channel) {

                if (oldMember.channel.id == member.voice.channel.id) {
                    return;
                }

                let memberVCSwitch = new Discord.MessageEmbed()
                    .setAuthor(`Member Moved Voice Channel`, member.user.displayAvatarURL())
                    .setColor(`#` + colors.blue)
                    .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
                    .addField(`Voice Channel`, `#${oldMember.channel.name} => #${member.voice.channel.name}`)
                    .setTimestamp()
                    .setFooter(`USER ID: ${member.user.id}`);

                (<Discord.TextChannel>bot.channels.cache.get(vclogs)).send(memberVCSwitch);
                return;

            }
            if (!oldMember.channel) {
                let memberVCJoin = new Discord.MessageEmbed()
                    .setAuthor(`Member Joined Voice Channel`, member.user.displayAvatarURL())
                    .setColor(`#` + colors.lime)
                    .addField(`User`, `<@${member.user.id}> (${member.user.tag})`)
                    .addField(`Voice Channel`, `#${member.voice.channel.name}`)
                    .setTimestamp()
                    .setFooter(`USER ID: ${member.user.id}`);

                (<Discord.TextChannel>bot.channels.cache.get(vclogs)).send(memberVCJoin);
                return;
            }
        }

    });

    bot.on(`roleCreate`, async (role) => {

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${role.guild.id}/config.json`, `utf8`));

        let obhGuild = role.guild;

        let roleCreate = new Discord.MessageEmbed()
            .setAuthor(`Role Created`, obhGuild.iconURL())
            .setColor(`#` + colors.lime)
            .addField(`Role`, `<@${role.name}> (${role.name})`)
            .setTimestamp()
            .setFooter(`ROLE ID: ${role.id}`);

        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(roleCreate);
        }
        return;

    });


    bot.on(`roleDelete`, async (role) => {

        // Import the configuration for the guild
        let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${role.guild.id}/config.json`, `utf8`));

        let obhGuild = role.guild;


        let roleDelete = new Discord.MessageEmbed()
            .setAuthor(`Role Deleted`, obhGuild.iconURL())
            .setColor(`#` + colors.red)
            .addField(`Role`, `<@${role.name}> (${role.name})`)
            .setTimestamp()
            .setFooter(`ROLE ID: ${role.id}`);

        if (guildConfig.logChannel) {
            (<Discord.TextChannel>bot.channels.cache.get(guildConfig.logChannel)).send(roleDelete);
        }
        return;
    });




};