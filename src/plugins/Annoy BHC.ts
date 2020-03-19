import * as Discord from 'discord.js';
import * as fs from 'fs';
import Pulsar from '../handlers/Pulsar';

module.exports.run = async (bot: Pulsar) => {

    bot.on("message", async (message) => {
        if(message.author.id == `249742551513300992` || message.author.id == `647485375157370900`){ //BHC and TylerTNT
            try {
               await message.react(`\uD83C\uDF4C`); //This is the Unicode constant for a banana emote. Not all platforms support non-ASCII chars in the file
            }
            catch {
                null;
            }
        }
        return;
    });
    
};

module.exports.info = {
    "name": "Annoy-BHC",
    "author": "severepain",
    "version": "1.0.0",
    "info": "React to messages from certain people with a banana emoji!"
}