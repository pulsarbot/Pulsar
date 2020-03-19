import Pulsar from "../handlers/Pulsar";
import {bot} from '../index';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import Triple from "../util/Triple";

export class MacroAPI {
	macros: Map<string, Triple<string, any, Function>>;
	discordClient: Pulsar;
	language: string;
	macroNames: string[];
	MacroError: any;

	constructor(){
		let path = require('path');
        let scriptName: string = path.basename(__filename).toString();

        if(scriptName.toLowerCase().endsWith(`.ts`)) this.language = `ts`;
		else this.language = 'js';
		
		this.discordClient = bot;
		this.macros = new Map;
		this.macroNames = [];
		this.MacroError = class MacroError {
			errorMessage: string;
			macroInfo: any;
			constructor(errorMessage: string, MacroInfo: object){
				this.errorMessage = errorMessage;
				this.macroInfo = MacroInfo;
			}
		};
		
	}

	loadMacros(){
		let dir = null;
		switch(this.language){
			case 'ts':
				dir = './src/macros/'
				break;
			case 'js':
				dir = './dist/macros/'
				break;
		}

		fs.readdir(dir, async (err, files) => {
            if (files.length <= 0) return console.log("[MACROS] There are no macros to load!");
            if (err) console.error(err);    
            let jsfiles = await files.filter(f => f.split(".").pop() === "ts" || f.endsWith(".js"));
			if(!jsfiles || jsfiles.length <= 0) return console.log("[PLUGINS] There are no macros to load!");
			let i = 0
			jsfiles.forEach(async file => {
				let fileCode: any = require( `../macros/${file}`);
				console.log(`[MACROS] ${i + 1}: ${file.toLowerCase()} [${fileCode.info.name}] loaded!`);
				if(this.macros.has(fileCode.info.name.toLowerCase())) return console.log(`[ERROR] [MACROS] You cannot register a macro with the same name! ${fileCode.info.name} conflicts with ${this.macros.get(fileCode.info.name).getElemTwo().name}!`);
				
				// Convert the run function to a string

				await this.macros.set(`${fileCode.info.name.toLowerCase()}`, new Triple(fileCode.info.name, fileCode.info, fileCode.run));
				await this.macroNames.push(fileCode.info.name.toLowerCase());
				if(fileCode.info.aliases.length > 0){
					fileCode.info.aliases.forEach(alias => {
						if(this.macros.has(alias.toLowerCase())) return console.log(`[ERROR] [MACROS] You cannot register a macro with the same alias! ${alias} conflicts with ${this.macros.get(alias).getElemTwo().name}!`);
						this.macros.set(`${alias.toLowerCase()}`, new Triple(fileCode.info.name, fileCode.info, fileCode.run));
					})
				}

				i++
			})
		});	
	}
}

