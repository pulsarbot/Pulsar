import {bot, cmdInterpreter} from '../index';
import {CommandCategory} from './commandapi/CommandCategory';

async function asyncForEach(array, callback): Promise<void> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }



export class commandConverter {
	
	constructor(){
	null;
	}

	async convertCmds(): Promise<object[]>{

		let commandsList = await cmdInterpreter.getRegisteredCommands()
		let returnArr = []
	
		await asyncForEach(commandsList, async command => {

			let commandCat = CommandCategory[command.category]

			let tempObj = {
				category: commandCat,
				name: command.name,
				aliases: command.aliases,
				description: command.description,
				usage: command.usage,
				examples: command.examples,
				ownerOnly: command.ownerOnly,
				trustedOnly: command.trustedOnly,
				permsRequired: command.permsRequired
			}
	
			returnArr.push(tempObj);
		});
	
		return returnArr;
	}

}

