import * as Discord from 'discord.js';
import * as fs from 'fs';
import cleverbotClient from 'cleverbot-free';
import Pulsar from '../handlers/Pulsar';

let antiDoxPlugin = require(`../modules/Antidox/antiDoxScreen`);
let checkDox = antiDoxPlugin.checkDox;

module.exports.run = async (bot: Pulsar) => {
	
    let contextObj:object = {};
    setInterval(function(){
        contextObj = {};
		bot.channels.cache.forEach(channel => {
			if(channel.type == "text"){
				(<Discord.TextChannel>channel).stopTyping()
			}
		});
    }, 10 * 60 * 1000) // Every 10 minutes, reset the context array

    let config:any = bot.config;
    
    bot.on("message", async (message) => {
        if (!message.channel || !message.guild) return;
        // Handle cleverbot integration if the module is enabled in config
        if (config.cleverbotOnMentions) {
            if (message.mentions.users && message.channel && message.channel.type == "text") {
                try {
                    if(!message.mentions.users.first()) return;
		    // Only use the feature if it mentions the bot and it is not a command
                    if (message.mentions.users.first().id === bot.user.id  &&! message.content.toLowerCase().startsWith(`${bot.config.prefix}`)){
						
                        if (!await checkDox(message.content)) { // If the message is not a dox, proceed

                            // Using context support for the bot by saving what the users say previously inside an array
                            if(!contextObj[message.author.id]) contextObj[message.author.id] = [];
                            else contextObj[message.author.id].push(`${message.content.replace(`<@${bot.user.id}>`, ``).replace(`<@!${bot.user.id}>`, ``)}`)

                            message.channel.startTyping();
                            cleverbotClient(message.content.replace(`<@${bot.user.id}>`, ``).replace(`<@!${bot.user.id}>`, ``), contextObj[message.author.id]).then(async response => {
                                await message.reply(response);
                            }).catch(async error => {
                                //Send a warning to the channel that an error occurred
                                await (message.reply(`:warning: Something went wrong. Try asking again later. ${error}`));
                            }).finally(async () => {
                                //Stop typing in the channel (no essays lol)
                                await message.channel.stopTyping();
                            });
                        }
                    }
                } catch (error) { // If there was an error, just do alert the user
		    console.log(error)
                    return message.reply(`:no_entry: An error has occured! Please try again later`);
                }
            }
        }
        else return;
        
    })

};

module.exports.info = {
    "name": "Cleverbot-Integration",
    "author": "severepain",
    "version": "1.0.0",
    "info": "Allows cleverbot to respond to messages that ping the bot!"
}
