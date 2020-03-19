import { bot } from '../index';
import * as fs from "fs";

const config = bot.config;


// Use the punishment handler provided by Kaimund600
import ModerationTimer from "../handlers/punishmentHandlers";
import PulsarGuild from "../handlers/PulsarGuild";
import { Message, TextChannel } from 'discord.js';
import { MessageChannel } from 'worker_threads';
import chalk from 'chalk';

// Enable the mobile status
// Credit to this guy: https://www.youtube.com/watch?v=BrZpXTe_urc (xTeal)
import Constants from 'discord.js/src/util/Constants';
if(config.useMobileStatus){
    Constants.DefaultOptions.ws.properties.$browser = `Discord Android`
}


async function asyncForEach(array, callback): Promise<void> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

async function configCreate(guildID: string): Promise<void> {
        let fetched = await bot.guilds.cache.get(guildID);
        
			fs.stat(`data/guilds/${fetched.id}`, function(err) {
				if (!err) {
					return;
				}
				else if (err.code === `ENOENT`) {
					fs.mkdirSync(`data/guilds/${fetched.id}`);
		
					   let fileContent = {
					   "reportChannel": false,
					   "cguild": true,
					   "actionChannel": false,
					   "funCommands":true,
					   "doxEnabled": true,
					   "reportNewAcc": false,
					   "customBannedWords": [``],
					   "logChannel": false,
					   "imageLogChannel": false,
					   "starBoardChannel": false,
					   "starsNeeded": 10
						   };
		
					   let toWrite = JSON.stringify(fileContent, null, 4);
                       fs.writeFileSync(`data/guilds/${fetched.id}/config.json`, toWrite);
                       fs.writeFileSync(`./data/guilds/${fetched.id}/muted-users.json`, JSON.stringify({}));
                       fs.writeFileSync(`./data/guilds/${fetched.id}/banned-users.json`, JSON.stringify({}));
                       fs.writeFileSync(`./data/guilds/${fetched.id}/image-muted-users.json`, JSON.stringify({}));
                       fs.writeFileSync(`./data/guilds/${fetched.id}/voice-muted-users.json`, JSON.stringify({}));
                       fs.writeFileSync(`./data/guilds/${fetched.id}/nickname-history.json`, JSON.stringify({}));
                       fs.writeFileSync(`./data/guilds/${fetched.id}/punishment-history.json`, JSON.stringify({}));
					return;
				}
			});
		
		}

bot.on(`ready`, async () => {

    let botOwner = await bot.fetchUser(config.ownerID);

    
    let antiDoxScreen = require(`../modules/Antidox/antiDoxScreen`);
    async function testAntidox(){
        let result = await antiDoxScreen.checkDox(process.env.ANTIDOX_TEST_STRING);
	    if(result) return true;
	    else return false;
    }

    if(bot.config.antiDoxEnabled){
	    console.log(chalk.yellow(`[ANTIDOX] Detected antidox module as enabled!`));
	    console.log(chalk.yellow(`[ANTIDOX] Testing the antidox API...`));
	    let result = await testAntidox();
	    if(!result){
		    console.log(chalk.red(`[ANTIDOX] There was a critical error in the antidox system! Please contact severepain!`));
	    } 
	    else {
		    console.log(chalk.greenBright(`[ANTIDOX] Validation complete! Starting up bot as normal!`));
        }
    }
    else {
	    console.log(chalk.red(`[ANTIDOX] Detected antidox module as disabled! Skipping self-test!`));
    }

    await asyncForEach(Array.from( await bot.guilds.cache.values() ) , async function(guild) {
	  
        await configCreate(guild.id); // Setup the Guild Config for the guild



        
        /*
         * The following code for checking all of the guilds and creating their configuration was provided by my friend Kaimund600's GautamaBuddha (and Shibe) project and under the direct permission of Kaimund600#0600! 
         * The code for that (private) project is licensed under GPL-3.0 [https://www.gnu.org/licenses/gpl-3.0.en.html]
         * Please support Kaimund600 and his other projects on GitHub at https://github.com/Kaimund600
         * https://kaimund600.org
         */
        try {
            if(!fs.opendirSync(`./data/guilds/${guild.id}`)) fs.mkdirSync(`data/guilds/${guild.id}`);
            if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
        }
        catch {
            fs.mkdirSync(`data/guilds/${guild.id}`);
            fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
        }
		
		


                // Create Pulsar Guild
             if(!await bot.pulsarGuilds.get(guild.id)){
                let currentPsGuild = new PulsarGuild(guild);
                await bot.pulsarGuilds.set(guild.id, currentPsGuild);
            }




    });

    new ModerationTimer(bot); // Create a moderation scheduler

    // Repeating this check every set MS
    bot.setInterval(() => {
        // Setting the bot activity to credit the botowner (in case of a username change)
        bot.user.setActivity(`pulsar.severepain.xyz`, {
            type: `STREAMING`,
            url: `https:twitch.tv/xseverepain`
        });


        bot.guilds.cache.forEach(async function(guild) {



            await configCreate(guild.id); // Setup the Guild Config for the guild
            
            /*
             * The following code for checking all of the guilds and creating their configuration was provided by my friend Kaimund600's GautamaBuddha (and Shibe) project and under the direct permission of Kaimund600#0600! 
             * The code for that (private) project is licensed under GPL-3.0 [https://www.gnu.org/licenses/gpl-3.0.en.html]
             * Please support Kaimund600 and his other projects on GitHub at https://github.com/Kaimund600
             * https://kaimund600.org
             */
            
            if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
		

            // Create Pulsar Guilds
            if(!await bot.pulsarGuilds.get(guild.id)){
                let currentPsGuild = new PulsarGuild(guild);
                await bot.pulsarGuilds.set(guild.id, currentPsGuild);
            }



        });


    }, 5 * 1000); // Repeat every 5 seconds

    await asyncForEach(Array.from(bot.pulsarGuilds.values()), async pulsarGuild => {
        let guildNickHistory = pulsarGuild.nickname_history;

        for(var prop in guildNickHistory){
            if(guildNickHistory[prop].length > 8){
                guildNickHistory[prop] = guildNickHistory[prop].slice(Math.max(guildNickHistory[prop].length - 8, 0)); // Last 8 entries
                await fs.writeFileSync(`./data/guilds/${pulsarGuild.id}/nickname-history.json`, JSON.stringify(guildNickHistory, null, 4));
            }
        }

    })
    
    setInterval(async function(){

        await asyncForEach(Array.from(bot.pulsarGuilds.values()), async pulsarGuild => {
            let guildNickHistory = pulsarGuild.nickname_history;

            for(var prop in guildNickHistory){
                if(guildNickHistory[prop].length > 8){
                    guildNickHistory[prop] = guildNickHistory[prop].slice(Math.max(guildNickHistory[prop].length - 8, 0)); // Last 8 entries
                }
            }

            await fs.writeFileSync(`./data/guilds/${pulsarGuild.id}/nickname-history.json`, JSON.stringify(guildNickHistory, null, 4));

        })

    }, 10 * 60 * 1000) // Every 10 minutes

    // Startup message inside console when the bot is starting up


    bot.guilds.cache.forEach(async function(serverlist) {
        let currentuser = await bot.fetchUser(serverlist.ownerID);
        console.log(`${serverlist.name}  with id  ${serverlist.id} || Guild owned by ${currentuser.tag} (${currentuser.id})`);
    });

    bot.channels.cache.forEach(channel => {
        if(channel.type == "text"){

            let textChannel = channel as TextChannel;
            try {
                textChannel.stopTyping()
            }
            catch {
                null;
           }
        }
    })

    		
    let defaultConfigFileContent = {
        "reportChannel": ``,
        "cguild": true,
        "actionChannel": ``,
        "funCommands":true,
        "doxEnabled": true,
        "reportNewAcc": false,
        "customBannedWords": [``],
        "logChannel": ``,
        "imageLogChannel": ``,
        "starBoardChannel": false,
        "starsNeeded": 10
    };

    bot.pulsarGuilds.forEach(async pulsarGuild => {
        for(var prop in defaultConfigFileContent){
            if(!pulsarGuild.config[prop] && pulsarGuild.config[prop] !== false){
                console.log(`[STARTUP] Incomplete Guild Config ${pulsarGuild.id} - Property: ${prop}! Auto set the value to false!`);
                if(prop == "starsNeeded") pulsarGuild.config[prop] = 10;
                else pulsarGuild.config[prop] = false;
            }
        }
        fs.writeFileSync(`./data/guilds/${pulsarGuild.id}/config.json`, JSON.stringify(pulsarGuild.config, null, 4));
    });

    setInterval(async function(){
        bot.pulsarGuilds.forEach(async pulsarGuild => {
            for(var prop in defaultConfigFileContent){
                if(!pulsarGuild.config[prop] && pulsarGuild.config[prop] !== false){
                    console.log(`[STARTUP] Incomplete Guild Config ${pulsarGuild.id} - Property: ${prop}! Auto set the value to false!`);
                    if(prop == "starsNeeded") pulsarGuild.config[prop] = 10
                    else pulsarGuild.config[prop] = false;
                }
            }
            fs.writeFileSync(`./data/guilds/${pulsarGuild.id}/config.json`, JSON.stringify(pulsarGuild.config, null, 4));
        });
    }, 60 * 1000)

    console.log(`----------------------------------`);
    console.log(`${bot.user.tag} is online on ${bot.guilds.cache.size} servers!`);
    console.log(`${config.botName} made by ${botOwner.tag} loaded!`);
    console.log(`----------------------------------`);

});
