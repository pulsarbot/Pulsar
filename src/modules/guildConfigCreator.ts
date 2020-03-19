import fs from 'fs';
import { bot } from '../index';


export class guildConfigurer{

	guildID: string

	constructor(guildID: string){
		this.guildID = guildID;
	}
async setupConfig(guildID: string): Promise<void> {

		let fetched = await bot.guilds.cache.get(guildID);
		
			const fs = require(`fs`); 
		
			fs.stat(`data/guilds/${fetched.id}`,function(err) {
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
				   fs.writeFile(`data/guilds/${fetched.id}/config.json`, toWrite, (err) => {
							   if (err) throw err;
							   console.log(`Created new guild config for ${fetched.name}`);
						   }); 
						 return;
				}
			});
		
		}

}