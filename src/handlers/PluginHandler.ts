/* eslint-disable @typescript-eslint/camelcase */
import * as Discord from 'discord.js';
import * as fs from 'fs';
import Pulsar from './Pulsar';
import chalk from 'chalk';

let config = require(`../../data/config.json`);

// Enables plugin-functionality for pulsar (making custom modules)

export default class PluginHandler {
    pluginsEnabled: boolean;
    plugins: object[];
    discordClient: Pulsar;

    constructor(bot: Pulsar){
    console.log(chalk.green(`[PLUGINS] Started up the plugin-handler!`));
     if(!config.plugins){
         this.pluginsEnabled = true;
     }  
     else {
         this.pluginsEnabled = false;
     }
     this.plugins = [];
     this.discordClient = bot;
    }

    registerPlugins(): Promise<void> {

        let path = require('path');
        let scriptName: string = path.basename(__filename).toString();

        let version = '';

        if(scriptName.toLowerCase().endsWith(`.ts`)) version = `ts`;
        else version = 'js';

        if(!config.plugins) {
            console.log(chalk.red(`[PLUGINS] Plugins are disabled in the config.json! Skipping the loading of them!`));
            return;  // Plugins are disabled
        } 

        let dir = null;
        switch (version){
            case 'js':
                dir = `./dist/plugins/` 
                break;
            case 'ts':
                dir = `./src/plugins/` 
                break;                
        }
        fs.readdir(dir, (err, files) => {
            if (files.length <= 0) return console.log(chalk.red("[PLUGINS] There are no plugins to load!"));
            if (err) console.error(err);    
            let jsfiles = files.filter(f => f.split(".").pop() === "ts" || f.split(".").pop() === "js");
            if (jsfiles.length <= 0) return console.log(chalk.red("[PLUGINS] There are no plugins to load!"));
            console.log(chalk.yellow(`[PLUGINS] Loading ${jsfiles.length} plugins...`));

            jsfiles.forEach(async (f, i) => {
                let plugin = require(`../plugins/${f}`);
                console.log(`[PLUGINS] ${i + 1}: ${plugin.info.name} [version ${plugin.info.version}] by ${plugin.info.author} loaded!`);
                this.plugins.push(plugin.info);
				await plugin.run(this.discordClient); // Run the plugin
            });


        });
        
        return;
    };


};