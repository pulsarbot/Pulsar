//Import first-party classes
import PulsarGuild from "./PulsarGuild";

//Import core Node modules and dependencies
import Discord, { ClientOptions } from "discord.js";

export default class Pulsar extends Discord.Client {
    config:any;
    pulsarGuilds: Discord.Collection<string, PulsarGuild>
    owner: string
    botAdmins: string[]

    constructor(clientOptions?:ClientOptions){
		//Call the superclass
		super(clientOptions);
		
		//Assign the class variables from the constructor's parameters
        this.config = require(`../../data/config.json`);
        this.pulsarGuilds = new Discord.Collection();
        this.owner = this.config.ownerID;
        this.botAdmins = this.config.botAdmins;
    }

    async fetchUser(userID: string): Promise<Discord.User> {
        let user = this.users.fetch(userID);
        if(user) return user
        else return null;

    }


}
