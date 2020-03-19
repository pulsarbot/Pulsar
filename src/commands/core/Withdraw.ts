//Import first-party classes
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";

export default class Withdraw extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"withdraw", //NAME
		"Withdraw the bot from a guild", //DESCRIPTION
		"withdraw [guildID] (silent)", //USAGE - [] = MANDATORY () = OPTIONAL
		["withdraw [exampleID] (silent)"], //EXAMPLES
		CommandCategory.CORE, //CATEGORY
		1, //MIN ARGS
		-1, //MAX ARGS
		["MANAGE_GUILD", "MANAGE_CHANNELS", "MANAGE_MESSAGES"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		true, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		true, //DELETE ON FINISH
		true, //SIMULATE TYPING
		0, //SPAM TIMEOUT
		["leave", "leaveguild", "exitguild"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "EightBall"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(Withdraw.commandFields, cmdConsole);
	}

	public async run(bot:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

        if(!bot.guilds.cache.get(args[0]) ||!args[0] ||!parseInt(args[0])) return message.reply(`:x: I am not in the guild \`${args[0]}\`! The correct usage is \`${Withdraw.commandFields.usage}\`!`);
        else {
            let guildToLeave = await bot.guilds.cache.get(args[0]) as Discord.Guild;

            if(!args[1]){
                try{
                    await guildToLeave.owner.user.send(`:no_entry: The bot has been revoked from your guild **${guildToLeave.name}**! Please contact a bot admin for more info!`)
                    await guildToLeave.leave()
                    message.reply(`:white_check_mark: Left the guild **${guildToLeave.name}** *[${guildToLeave.id}]*!`)
                }
                catch {
                    message.reply(`:no_entry: An Error Occured! Please contact sevp or revise your arguments!`)
                    return;
                }
            }
            else if(args[1].toLowerCase() == "silent"){
                try {
                	await guildToLeave.leave()
               		message.reply(`:white_check_mark: Left the guild **${guildToLeave.name}** *[${guildToLeave.id}]*!`)
                }
                catch {
                    message.reply(`:no_entry: An Error Occured! Please contact sevp or revise your arguments!`)
                    return;
                }

            }
            else if(args[1].toLowerCase() !== "silent"){
            	message.reply(`:x: Invalid args! \`${args[1]}\` is not a valid argument!`);
            }
        }

		//await message.delete()
		
		//End execution by resolving the promise
		return Promise.resolve(true);
	}
}