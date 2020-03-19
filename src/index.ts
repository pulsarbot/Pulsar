//Import first-party classes
import Console from './modules/commandapi/interpreter/Console';
import { eventHandler } from './events/EventLoader';
import Interpreter from './modules/commandapi/interpreter/Interpreter';
import * as MacroHandler from './handlers/MacroAPI';
import Pulsar from './handlers/Pulsar';
import PluginHandler from './handlers/PluginHandler';

//Import core Node modules and dependencies
import axios from 'axios';
import chalk from 'chalk';
import * as Discord from 'discord.js';
import * as dotEnv from 'dotenv';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

//Get the environment variables
dotEnv.config({path: "secret.env"});

let port:number = parseInt(process.env.PORT);
let mainBotToken:string = process.env.BOT_TOKEN;
let indevBotToken:string = process.env.INDEV_TOKEN;

//Create a new bot instance
export const bot:Pulsar = new Pulsar({
    fetchAllMembers: true
});

//Create a new console instance
export const cmdConsole:Console = new Console();

//Create a new interpreter instance
export const cmdInterpreter:Interpreter = new Interpreter(bot, cmdConsole);

// Create a new pluginhandler instance
export const pluginManager:PluginHandler = new PluginHandler(bot);

// Create a MacroAPI instance
export const MacroAPI:MacroHandler.MacroAPI = new MacroHandler.MacroAPI();
MacroAPI.loadMacros(); // Load in all of the macros

// Attempt to load in all of the plugins
pluginManager.registerPlugins();

//Initialize the event handlers
let eventManager = new eventHandler(bot, cmdInterpreter);

//Load in the custom modules
require(`./modules/BHModules/antiSpam`)(bot);
require(`./modules/BHModules/leveledRoles`)(bot);

//Load in other modules
require(`./modules/loggingModules/eventLogging`)(bot);
require(`./modules/loggingModules/imageLogging`)(bot);
require(`./modules/starBoardSystem`)(bot);


// Monitor discord WS events
bot.on("error", async function(error){
	return console.log(`[WS ERROR] ${bot.config.botName} has encountered a websocket error! The error is: ${error.name} (Stack: ${error.stack})`);
  });
  
  bot.on('shardReconnecting', async function(){
	return console.log(`[WS RECONNECTING] ${bot.config.botName} is attempting to reconnect to discord!`);
  });
  
  bot.on('shardResume', async function(replayed){
	return console.log(`[WS RECONNECTED] ${bot.config.botName} has reconnected! Replays: ${replayed}`);
  });
  


// Load in web
let app = require(`./web/app`);
let listener = null;
try {
	listener = app.listen(port, function(){
		console.log(chalk.green(`[WEB PANEL] Panel Started! Listening on port ${port}!`));
	});
}
catch(error){
	console.log(chalk.red(`[WEB PANEL] There was an error starting the web panel! Stack: ${error.stack} (${error})`));
	process.exit(1);
}

//AUTOMATIC COMMAND INITIALIZATION
let commandHandler = require(`./commands/CommandLoader`);
commandHandler.loadCommands(); // Load in all of the commands

if(!fs.existsSync(`./data/guilds/bannedGuildOwners.txt`) &&! fs.existsSync(`./data/guilds/bannedGuilds.txt`)){
	fs.mkdirSync(`./data/guilds`);
}

// If there is no file to log cbans, create it
if(bot.config.cban.moduleEnabled){

	if(!fs.existsSync(`./data/community-bans.json`)){
	console.log(`[COMMUNITY BANS] Creating the community bans logging JSON file!`)
	fs.writeFileSync(`./data/community-bans.json`, JSON.stringify({}, null, 4));
	}
	
}

if(bot.config.antiDoxEnabled){
	if(!fs.existsSync(`./data/doxEvents.json`)){
		console.log(`[ANTIDOX] Creating the antidox logging JSON file!`)
		fs.writeFileSync(`./data/doxEvents.json`, JSON.stringify({}, null, 4));
		}
}

if(!fs.existsSync(`./data/guilds/bannedGuildOwners.txt`)){
	console.log(`[STARTUP] Creating the banned guild owners file!`)
	fs.writeFileSync(`./data/guilds/bannedGuildOwners.txt`, ``);
}

if(!fs.existsSync(`./data/modules/bh/levels.json`)){
	console.log(`[STARTUP] Creating the levels file!`)
	fs.writeFileSync(`./data/modules/bh/levels.json`, JSON.stringify({}, null, 4));
}

if(!fs.existsSync(`./data/guilds/bannedGuilds.txt`)){
	console.log(`[STARTUP] Creating the banned guilds file!`)
	fs.writeFileSync(`./data/guilds/bannedGuilds.txt`, ``);
}

// Attempt to login to the bot
try{
	bot.login(mainBotToken);
}
catch (error) {
	console.log(chalk.red.bold(`[CRITICAL ERROR] There was an error logging into the bot! Stack: ${error.stack} (${error})`));
	process.exit(1);
}

