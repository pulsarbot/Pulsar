/* eslint-disable no-prototype-builtins */
import fs from 'fs';
import Pulsar from '../../handlers/Pulsar';

// Vanilla JS
async function leveledRoles(bot: Pulsar): Promise<void> {
	//Set the directory for the OBH files
	let obhDir:string = `./data/modules/bh`;

    // Directly copy+pasted from the old Version (and added beautification) - that is why it is so sloppy and has no comments
    console.log(`[LEVELED ROLES] Module Started!`);

    if(!fs.existsSync(obhDir + `/levels.json`)){
        fs.writeFileSync(`${obhDir}/levels.json`, JSON.stringify({}));
    }
    if(!fs.existsSync(obhDir + `/lastSync.txt`)){
        fs.writeFileSync(`${obhDir}/lastSync.txt`, "");
        let lastSyncStream = fs.createWriteStream(`${obhDir}/lastSync.txt`);
        lastSyncStream.write(`${Date.now()}`);
        lastSyncStream.close();
    }

    let leveledConfig = JSON.parse(fs.readFileSync(`${obhDir}/leveledConfig.json`).toString());
    let levels = JSON.parse(fs.readFileSync(`${obhDir}/levels.json`, `utf8`));
    let obh = await bot.pulsarGuilds.get(leveledConfig.guildEnabled);
    bot.on(`ready`, async () => {
        let addLevels = false;
        let addAm = 50;
        if (addLevels) {
            let newt = JSON.parse(fs.readFileSync(`${obhDir}/levels.json`, `utf8`));
            let otherFileDup = JSON.parse(fs.readFileSync(`${obhDir}/levels.json`, `utf8`));
            for (let property in newt) {
                let lastNum = Number(parseInt(JSON.stringify(otherFileDup[property])));
                let newNum = lastNum + addAm;
                otherFileDup[property] = newNum;
                fs.writeFileSync(`${obhDir}/levels.json`, JSON.stringify(otherFileDup, null, 2));
            }
        }

        function convertToMS(days): number {
            let returnInt = days * 24 * 60 * 60 * 1000;
            return returnInt;
        }
        setInterval(async function() {
            let lastSync = fs.readFileSync(`${obhDir}/lastSync.txt`).toString();
            if (!lastSync || lastSync.length == 0 || lastSync == `` || lastSync == ` ` || lastSync == `\n`) {
                let lastSyncStream = fs.createWriteStream(`${obhDir}/lastSync.txt`);
                lastSyncStream.write(`${Date.now()}`);
            }
            let timeBetween = Date.now() - parseInt(lastSync);
            if (timeBetween >= convertToMS(leveledConfig.checkEveryDays)) {
                let rolesAndThresh = leveledConfig.roles;
                for (let prop in levels) {
                    obh = await bot.pulsarGuilds.get(leveledConfig.guildEnabled);
                    let logChannel = await bot.channels.cache.get(`451392471490887691`);
                    let memberFetched = await obh.members.cache.get(prop);
                    let lastNum = levels[prop];
                    if (!memberFetched) continue;
                }
                console.log(`[LEVELED ROLES] Resetting data!`);
                let createStream = fs.createWriteStream(`${obhDir}/lastSync.txt`);
                createStream.write(`${Date.now()}`);
                createStream.end();
            }
        }, 5000);
    });
    bot.on(`message`, async (message) => {
        if (message.author.bot) return;
        if (!message.guild.id) return;
        if (!message.channel.id) return;
        if (message.channel.id == `451364770872819735`) {
            return;
        }
        if (message.content.toLowerCase().startsWith(`${bot.config.prefix}level`)) return;
        if (!message.content || message.content == ` `) return;
        if (message.attachments && !message.content) return;
        let input = message.content.toLowerCase();
        if (input.startsWith(`${bot.config.prefix} `) || input.startsWith(`buddha `)) return;
        if (message.guild.id == `451248270409334796`) {
            let otherFileDup = JSON.parse(fs.readFileSync(`${obhDir}/levels.json`, `utf8`));
            if (!otherFileDup.hasOwnProperty(message.author.id)) {
                otherFileDup[message.author.id] = 1;
                fs.writeFileSync(`${obhDir}/levels.json`, JSON.stringify(otherFileDup, null, 2));
                return;
            }
            for (let property in otherFileDup) {
                if (property == message.author.id) {
                    let lastNum = Number(parseInt(JSON.stringify(otherFileDup[property])));
                    let newNum = lastNum + 1;
                    otherFileDup[property] = newNum;
                    fs.writeFileSync(`${obhDir}/levels.json`, JSON.stringify(otherFileDup, null, 2));
                    return;
                }
            }
            return;
        }
    });
    bot.on(`guildMemberRemove`, async (member) => {
        let newTop = JSON.parse(fs.readFileSync(`${obhDir}/levels.json`, `utf8`));
        obh = await bot.pulsarGuilds.get(`451248270409334796`);
        if (member.guild.id !== obh.id) return;
        if (!leveledConfig.onLeaveReset) return;
        if (levels.hasOwnProperty(member.user.id)) {
            newTop[member.user.id] = 0;
            fs.writeFile(`${obhDir}/levels.json`, JSON.stringify(newTop, null, 2), function(err) {
                if (err) return console.log(err);
            });
        }
        return;
    });
}
module.exports = leveledRoles;