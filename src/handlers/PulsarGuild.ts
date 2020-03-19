/* eslint-disable @typescript-eslint/camelcase */
import * as Discord from 'discord.js';
import {bot} from '../index';
import * as fs from 'fs';
import Banlist from '../modules/banlist';

function getGuildConfig(guildID: string): object{
	let guild = {id: guildID}; // Too lazy to change var names

	if(!fs.opendirSync(`./data/guilds/${guild.id}`)) fs.mkdirSync(`data/guilds/${guild.id}`);
	if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
	if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
	if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
	if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
	if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
	if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
	if (!fs.existsSync(`./data/guilds/${guild.id}/config.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/config.json`, JSON.stringify({
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
			}));

	let guildConfig = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/config.json`).toString());
	return guildConfig as object;
}

function getMuteTypeUsers(guildID: string, muteType: string): object{
	let obj = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/${muteType}.json`).toString());
	return obj as object;
}

function getTempBannedUsers(guildID: string): object{
	let obj = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/banned-users.json`).toString());
	return obj as object;
}

function getNicknameHistory(guildID: string): object {
	let obj = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/nickname-history.json`).toString());
	return obj as object;
}

function getPunishmentHitory(guildID: string): object {
    if (!fs.existsSync(`./data/guilds/${guildID}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guildID}/punishment-history.json`, JSON.stringify({}));
	let obj = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/punishment-history.json`).toString());
	return obj as object;
}

function addPunishmentToHistory(caseID: string, punishmentObj: any, guildID: string){
    if (!fs.existsSync(`./data/guilds/${guildID}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guildID}/punishment-history.json`, JSON.stringify({}));
	let obj = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/punishment-history.json`).toString());
	if(!punishmentObj.status) punishmentObj.status = '**Still Punished**';
	obj[caseID] = punishmentObj;
	fs.writeFileSync(`./data/guilds/${guildID}/punishment-history.json`, JSON.stringify(obj, null, "\t"));
}

function editPunishmentHistory(guildID: string, caseID: string, newStatus: string, newPunishmentObj?: any){
	if (!fs.existsSync(`./data/guilds/${guildID}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guildID}/punishment-history.json`, JSON.stringify({}));
	let obj = JSON.parse(fs.readFileSync(`./data/guilds/${guildID}/punishment-history.json`).toString());
	if(!obj[caseID]) return false;

	if(newPunishmentObj) obj[caseID] = newPunishmentObj;
	obj[caseID].status = newStatus;

	fs.writeFileSync(`./data/guilds/${guildID}/punishment-history.json`, JSON.stringify(obj, null, "\t"));
}


type muteKind = `regular` | `default` | `mute` | `image` | `voice` // Custom type for muteKinds

/*
* This class is to simplify the calling of all of the guild config/logging files 
* It also simplifies the usage of the discord banlist (using the banlist class)
*/
class PulsarGuild extends Discord.Guild {
	
	config: object
	muted_users: object
	image_muted_users: object
	voice_muted_users: object
	temp_banned_users: object
	id: string
	banlist: Banlist
	nickname_history: object
	punishment_history: object

	async refreshConfig(): Promise<void>{
		return new Promise(async (resolve) => {
			this.config = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/config.json`).toString());
			return resolve();
	});

	}

	async refreshNicknameHistory(): Promise<void>{
		this.nickname_history = getNicknameHistory(this.id);
	}

	async refreshMutes(): Promise<void>{
		this.muted_users = getMuteTypeUsers(this.id, `muted-users`);
		this.image_muted_users = getMuteTypeUsers(this.id, `image-muted-users`);
		this.voice_muted_users = getMuteTypeUsers(this.id, `voice-muted-users`);
	}

	async refreshTempBans(): Promise<void>{
		this.temp_banned_users = getTempBannedUsers(this.id);
		return;
	}

	async createMutedUserEntry(moderatorID: string, muteType: muteKind, userID: string, timestampToRemoveMute: number, reason: any, caseID?: string): Promise<boolean>{

			let muteKind = muteType.toLowerCase();
			
			await this.refreshMutes();

			let finalCaseID = caseID || Discord.SnowflakeUtil.generate(Date.now());
			let toWriteObj = {
				"time": timestampToRemoveMute,
				"reason": null,
				"caseID": finalCaseID,
				"moderatorID": moderatorID,
				"type": "",
				"userID": userID
			};
			if(reason) toWriteObj.reason = reason;
			let mutedUsersFileContent = null;
			
			if(muteKind == `regular` || muteKind == `mute` || muteKind == `default`){
				toWriteObj.type = "mute"
				addPunishmentToHistory(finalCaseID, toWriteObj, this.id);
				mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/muted-users.json`).toString());

				if(mutedUsersFileContent[userID]){
					return false;
				}
				else {
					mutedUsersFileContent[userID] = toWriteObj;
					fs.writeFileSync(`./data/guilds/${this.id}/muted-users.json`, JSON.stringify(mutedUsersFileContent, null, "\t"));
					await this.refreshMutes();
					return true;
				}
			}
			else if(muteKind == `image`){
				toWriteObj.type = "image mute"
				addPunishmentToHistory(finalCaseID, toWriteObj, this.id);
				mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/image-muted-users.json`).toString());

				if(mutedUsersFileContent[userID]){
					return false;
				}
				else {
					mutedUsersFileContent[userID] = toWriteObj;
					fs.writeFileSync(`./data/guilds/${this.id}/image-muted-users.json`, JSON.stringify(mutedUsersFileContent, null, "\t"));
					await this.refreshMutes();
					return true;
				}
			}
			else if(muteKind == `voice`){
				toWriteObj.type = "voice mute"
				addPunishmentToHistory(finalCaseID, toWriteObj, this.id);
				mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/voice-muted-users.json`).toString());

				if(mutedUsersFileContent[userID]){
					return false;
				}
				else {
					mutedUsersFileContent[userID] = toWriteObj;
					fs.writeFileSync(`./data/guilds/${this.id}/voice-muted-users.json`, JSON.stringify(mutedUsersFileContent, null, "\t"));
					await this.refreshMutes();
					return true;
				}
			}
			else {
				return false;
			}

	}

	async deleteMutedUserEntry(muteType: muteKind, userID: string): Promise<boolean>{
		let muteKind = muteType.toLowerCase();
			
		await this.refreshMutes();
		let mutedUsersFileContent = null;

		
		if(muteKind == `regular` || muteKind == `mute` || muteKind == `default`){
			mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/muted-users.json`).toString());

			if(!mutedUsersFileContent[userID]){
				return false;
			}
			else {
				editPunishmentHistory(this.id, mutedUsersFileContent[userID].caseID, `**Punishment Revoked!**`);
				delete mutedUsersFileContent[userID];
				fs.writeFileSync(`./data/guilds/${this.id}/muted-users.json`, JSON.stringify(mutedUsersFileContent, null, "\t"));
				await this.refreshMutes();
				return true;
			}
		}
		else if(muteKind == `image`){
			mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/image-muted-users.json`).toString());

			if(!mutedUsersFileContent[userID]){
				return false;
			}
			else {
				
				editPunishmentHistory(this.id, mutedUsersFileContent[userID].caseID, `**Punishment Revoked!**`);
				delete mutedUsersFileContent[userID];
				fs.writeFileSync(`./data/guilds/${this.id}/image-muted-users.json`, JSON.stringify(mutedUsersFileContent, null, "\t"));
				await this.refreshMutes();
				return true;
			}
		}
		else if(muteKind == `voice`){
			mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/voice-muted-users.json`).toString());

			if(!mutedUsersFileContent[userID]){
				return false;
			}
			else {
				editPunishmentHistory(this.id, mutedUsersFileContent[userID].caseID, `**Punishment Revoked!**`);
				delete mutedUsersFileContent[userID];
				fs.writeFileSync(`./data/guilds/${this.id}/voice-muted-users.json`, JSON.stringify(mutedUsersFileContent, null, "\t"));
				await this.refreshMutes();
				return true;
			}
		}
		else {
			return false;
		}
	}

	async resolveCase(userID: string, caseID: string, punishmentType: string): Promise<void> {
		let caseOBJ = this.getCase(caseID);
		await editPunishmentHistory(this.id, caseID, `**Punishment expired!**` )
	}

	async isUserMuted(muteType: muteKind, userID: string): Promise<boolean>{

		let muteKind = muteType.toLowerCase();	
		await this.refreshMutes();

		let mutedUsersFileContent = null;
		if(muteKind == `regular` || muteKind == `mute` || muteKind == `default`){
			mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/muted-users.json`).toString());

			if(mutedUsersFileContent[userID]){
				return true;
			}
			else {
				return false;
			}
		}
		else if(muteKind == `image`){
			mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/image-muted-users.json`).toString());

			if(mutedUsersFileContent[userID]){
				return true;
			}
			else {
				return false;
			}
		}
		else if(muteKind == `voice`){
			mutedUsersFileContent = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/voice-muted-users.json`).toString());

			if(mutedUsersFileContent[userID]){
				return true;
			}
			else {
				return false;
			}
		}


	}

	async createTempBannedUserEntry(moderatorID: string, userID: string, userTag: string, userAvatarURL: string, timestampToRemoveBan: number, reason: any, caseID?: string): Promise<boolean>{

		await this.refreshTempBans();
		let bannedUserEntries = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/banned-users.json`).toString());

		let finalCaseID = caseID || Discord.SnowflakeUtil.generate(Date.now())
		let toWriteObj = {
            "username": userTag,
            "avatar": userAvatarURL,
            "time": timestampToRemoveBan,
			"reason": reason,
			"caseID": finalCaseID,
			"moderatorID": moderatorID,
			"type": "ban",
			"userID": userID
		};

		if(bannedUserEntries[userID]){
			return false;
		}
		else {
			addPunishmentToHistory(finalCaseID, toWriteObj, this.id);
			bannedUserEntries[userID] = toWriteObj;
			fs.writeFileSync(`./data/guilds/${this.id}/banned-users.json`, JSON.stringify(bannedUserEntries, null, "\t"));
			await this.refreshTempBans();
			return true;
		}

	}

	async deleteTempBannedUserEntry(userID: string): Promise<boolean>{

		await this.refreshTempBans();
		let bannedUserEntries = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/banned-users.json`).toString());

		if(!bannedUserEntries[userID]){
			return false;
		}
		else {
			
			editPunishmentHistory(this.id, bannedUserEntries[userID].caseID, `:white_check_mark: Punishment Revoked`);
			delete bannedUserEntries[userID];
			fs.writeFileSync(`./data/guilds/${this.id}/banned-users.json`, JSON.stringify(bannedUserEntries, null, "\t"));
			await this.refreshTempBans();
			return true;
		}
		
	}

	async getCase(caseID: string): Promise<any> {
		let image_mutes = this.image_muted_users;
		let bans = this.temp_banned_users;
		let mutes = this.muted_users;
		let voice_mutes = this.voice_muted_users;

		let caseObj: any;
		let caseType: string;
		let userID: string;

		/*
		for(var i in bans){
			if(!bans[i].caseID) continue;
			if(bans[i].caseID == caseID){
				caseObj = bans[i]
				caseType = `ban`;
				userID = i;
				return {
					"caseType": caseType,
					"object": caseObj,
					"userID": userID
				};
			}
			else continue
		}

		for(var i in image_mutes){
			if(!image_mutes[i].caseID) continue;
			if(image_mutes[i].caseID == caseID){
				caseObj = image_mutes[i]
				userID = i;
				caseType = `image_mute`;
				return {
					"caseType": caseType,
					"object": caseObj,
					"userID": userID
				};
			}
			else continue
		}

		for(var i in mutes){
			if(!mutes[i].caseID) continue;
			if(mutes[i].caseID == caseID){
				caseObj = mutes[i]
				userID = i;
				caseType = `mute`;
				return {
					"caseType": caseType,
					"object": caseObj,
					"userID": userID
				};
			}
			else continue
		}

		for(var i in voice_mutes){
			if(!voice_mutes[i].caseID) continue;
			if(voice_mutes[i].caseID == caseID){
				caseObj = voice_mutes[i]
				userID = i;
				caseType = `voice_mute`;
				return {
					"caseType": caseType,
					"object": caseObj,
					"userID": userID
				};
			}
			else continue
		}

		if(!caseObj) return false;
		*/

		let punishment_history: any = this.punishment_history

		if(punishment_history[caseID]) return {
			"caseType": punishment_history[caseID].type,
			"object": punishment_history[caseID],
			"userID": punishment_history[caseID].userID
		}
		else return false;

	}

	async refreshAll(): Promise<void>{

		return new Promise(async (resolve) => {
			this.config = await JSON.parse(fs.readFileSync(`./data/guilds/${this.id}/config.json`).toString());
			this.temp_banned_users = getTempBannedUsers(this.id);
			this.muted_users = getMuteTypeUsers(this.id, `muted-users`);
			this.image_muted_users = getMuteTypeUsers(this.id, `image-muted-users`);
			this.voice_muted_users = getMuteTypeUsers(this.id, `voice-muted-users`);
			this.nickname_history = getNicknameHistory(this.id);
			this.punishment_history = getPunishmentHitory(this.id)

			return resolve();
		});

	}

	ban(member, options?: Discord.BanOptions) {
		return this.members.ban(member, options);
	  }

	unban(user: Discord.UserResolvable, reason?: string) {
		return this.members.unban(user, reason);
	  }

	 constructor(discordGuild: Discord.Guild){

		 super(bot, null); // Leave Empty - Idk why but it works when it is empty
		 let guild = discordGuild;

		 try {
            if(!fs.opendirSync(`./data/guilds/${guild.id}`)) fs.mkdirSync(`data/guilds/${guild.id}`);
            if (!fs.existsSync(`./data/guilds/${guild.id}/muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/banned-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/image-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/voice-muted-users.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
            if (!fs.existsSync(`./data/guilds/${guild.id}/nickname-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
			if (!fs.existsSync(`./data/guilds/${guild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
			if (!fs.existsSync(`./data/guilds/${guild.id}/config.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/config.json`, JSON.stringify({
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
					}));
        }
        catch {
            fs.mkdirSync(`data/guilds/${guild.id}`);
            fs.writeFileSync(`./data/guilds/${guild.id}/muted-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/banned-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/image-muted-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/voice-muted-users.json`, JSON.stringify({}));
            fs.writeFileSync(`./data/guilds/${guild.id}/nickname-history.json`, JSON.stringify({}));
			fs.writeFileSync(`./data/guilds/${guild.id}/punishment-history.json`, JSON.stringify({}));
			if (!fs.existsSync(`./data/guilds/${guild.id}/config.json`)) fs.writeFileSync(`./data/guilds/${guild.id}/config.json`, JSON.stringify({
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
					}));
		}
		
		 if (!fs.existsSync(`./data/guilds/${discordGuild.id}/punishment-history.json`)) fs.writeFileSync(`./data/guilds/${discordGuild.id}/punishment-history.json`, JSON.stringify({}));
		 this.config = getGuildConfig(discordGuild.id);
		 this.muted_users = getMuteTypeUsers(discordGuild.id, `muted-users`);
		 this.image_muted_users = getMuteTypeUsers(discordGuild.id, `image-muted-users`);
		 this.voice_muted_users = getMuteTypeUsers(discordGuild.id, `voice-muted-users`);
		 this.temp_banned_users = getTempBannedUsers(discordGuild.id);
		 this.id = discordGuild.id;
		 this.banlist = new Banlist(discordGuild.id);
		 this.nickname_history = getNicknameHistory(this.id);
		 this.punishment_history = getPunishmentHitory(this.id);


	}


	
}

setInterval(() => {
	bot.pulsarGuilds.forEach(async pulsarGuild => {
		await pulsarGuild.refreshAll();
	});
}, 500); // Refresh all the data in the pulsar guild every half a second


export = PulsarGuild;
