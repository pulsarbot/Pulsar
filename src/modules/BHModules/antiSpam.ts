import fs from 'fs';
import Discord from 'discord.js';
import Pulsar from '../../handlers/Pulsar';



module.exports = async function(bot: Pulsar): Promise<void> {

  const config = bot.config;

  let obh = config.OBHGuildID;
  let logs = config.OBHLogsID;

    // Using an NPM Module called DiscordAntiSpam

let DiscordAntiSpam = require(`discord-anti-spam`);

const AntiSpam = new DiscordAntiSpam({
    warnThreshold: 5, // Amount of messages sent in a row that will cause a warning.
    kickThreshold: 7, // Amount of messages sent in a row that will cause a kick
    banThreshold: 100, // Amount of messages sent in a row that will cause a ban
    maxInterval: 3500, // Amount of time (in ms) in which messages are cosidered spam.
    warnMessage: `:warning: {@user}, Please stop spamming.`, // Message will be sent in chat upon warning.
    kickMessage: `:no_entry: **{user_tag}** has been kicked for spamming`, // Message will be sent in chat upon kick
    banMessage: `:no_entry: **{user_tag}** has been banned for spamming.`, // Message will be sent in chat upon banning.
    maxDuplicatesWarning: 100000000, // Amount of same messages sent that will be considered as duplicates that will cause a warning.
    maxDuplicatesKick: 10000000000000000, // Amount of same messages sent that will be considered as duplicates that will cause a kick
    maxDuplicatesBan: 100000000000000000000, // Amount of same messages sent that will be considered as duplicates that will cause a ban.
    deleteMessagesAfterBanForPastDays: 1, // Amount of days in which old messages will be deleted. (1-7)
    exemptPermissions: [`MANAGE_MESSAGES`, `ADMINISTRATOR`, `MANAGE_GUILD`, `BAN_MEMBERS`], // Bypass users with at least one of these permissions
    ignoreBots: true, // Ignore bot messages
    verbose: false, // Extended Logs from module
    ignoredUsers: [], // Array of string user IDs that are ignored
    ignoredGuilds: [], // Array of string Guild IDs that are ignored
    ignoredChannels: [] // Array of string channels IDs that are ignored
  });


  if(!bot.guilds.cache.has(obh)) return;
  let obhGuild = await bot.guilds.cache.get(obh);

  // Scanning the message
  bot.on(`message`, async (message) => {

    if(!message.guild) return;
    if(message.guild.id !== "451248270409334796") return;


    if (message.guild.id.toString() !== obh.toString()) return; // OBH-only
    
    let blacklisted = [`discord.gg/`, `discordapp.com/`, `bestgore.com`, `pornhub.com`];

    if (blacklisted.includes(message.content.toLowerCase()) && !message.content.includes(`discord.gg/Day38kv`) && !message.member.hasPermission(`MANAGE_MESSAGES`)) {
        message.delete();
        message.reply(`:warning: That link is not allowed!`);
        (<Discord.TextChannel> obhGuild.channels.cache.get(logs)).send(`:warning: Warned user: <@${message.author.id}> (${message.author.tag}) for blacklisted link! *offending item: ${message.content}*`);
    }

    if (!message.member) return;
    AntiSpam.message(message);
});

    setInterval(function(){
      AntiSpam.resetData();
    },6000);
    
    AntiSpam.on(`warnAdd`, async (member) => {
      (<Discord.TextChannel> obhGuild.channels.cache.get(logs)).send(`:warning: Warned user: <@${member.user.id}> (${member.user.tag}) for spamming!`);
  });

  AntiSpam.on(`kickAdd`, (member) => {
      (<Discord.TextChannel> obhGuild.channels.cache.get(logs)).send(`:no_entry: Kicked user: <@${member.user.id}> (${member.user.tag}) for spamming!`);
      member.user.send(`:no_entry: You have been kicked from **${member.guild.name}** for spamming!`);
  });

  AntiSpam.on(`banAdd`, (member) => {
      (<Discord.TextChannel> obhGuild.channels.cache.get(logs)).send(`:no_entry: Banned user: <@${member.user.id}> (${member.user.tag}) for spamming!`);
      member.user.send(`:no_entry: You have been banned from **${member.guild.name}** for spamming!`);
  });



};