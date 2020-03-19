import * as Discord from 'discord.js';
import * as fs from 'fs';
import Pulsar from '../handlers/Pulsar';

module.exports.run = async (bot: Pulsar) => {

    bot.on("message", async (message) => {
        // If there is no guild, return
        if(!message.guild) return;
        // Checking if there is more than 5 people mentioned in a message
        if(message.mentions.members.size >= 4 &&! message.member.hasPermission(`MANAGE_MESSAGES`)){
            message.delete();
            message.reply(`:warning: Don't mass mention!`);
            return;
        }
        // No mass mentions, do nothing
        else return;
    });
    
};

module.exports.info = {
    "name": "Anti-Mass-Mention",
    "author": "severepain",
    "version": "1.0.0",
    "info": "Auto-delete messages that mention more than 5 users!"
}