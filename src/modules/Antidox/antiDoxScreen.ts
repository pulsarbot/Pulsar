const fs = require(`fs`);
import { bot } from '../../index';
const config = require(`../../../data/config.json`);


export async function checkDox(messageString: string): Promise<boolean>{

    if(!messageString) return false;
    if(messageString.length < 1) return false;

    let doxObjs = await require(`./apiRequester`)(bot, messageString);

    if(doxObjs.isDox){
        return true;
    }
    else {
        return false;
    }

}

export async function checkBlacklisted(messageString: string): Promise<boolean> {

    if(!messageString) return false;
    if(messageString.length < 1) return false;
    
    let blacklistedObjs = await require(`./apiRequester`)(bot, messageString);

    if(blacklistedObjs.isBlacklisted){
        return true;
    }
    else {
        return false;
    }
    
}

