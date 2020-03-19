/**
 * Defines all of the available
 * command categories
 * @author Spotlightsrule
 */
export enum CommandCategory {
	/** Represents commands that are for guild administration */
	ADMINISTRATION,

	/** Represents commands that are core to the bot or will have a global effect */
	CORE,

	/** Represents commands that are specific to certain guilds */
	CUSTOM,

	/** Represents commands that are there to entertain users */
	FUN,

	/** Represents commands that are unclassified */
	MISCELLANEOUS,

	/** Represents commands that are for guild moderation */
	MODERATION,

	/** Represents commands that generate NSFW content (eg: nudity, suggestive material, porn, hentai, etc). These commands are locked to NSFW channels */
	NSFW,

	/** Represents commands that are there to help users */
	UTILITY
}

//Enum utilties (must be exported under the namespace header)
export namespace CommandCategory {
	/**
 	 * Creates a grammatical list of the
 	 * enum's contents
 	 * @author Spotlightsrule
	 * @return <b>string</b> The list of the enum's contents
 	*/
	export function values():string {
		//Create a string to hold the list of enum values
		let enumValues:string = "";

		//Get the number of elements in the enum
		//SEE: https://stackoverflow.com/a/54341904/7520602
		let enumLen:number = (Object.keys(CommandCategory).map((val, idx) => Number(isNaN(Number(val)))).reduce((a, b) => a + b, 0));

		//Loop over the enum
		for(let category in CommandCategory){
			//Check if the current category is an index
			if(parseInt(category, 10) >= 0){
				//Append it onto the enum list
				enumValues += (`${CommandCategory[category]}`);

				//Ensure that the current enum value is not at the end of the list
				if(parseInt(category) < (enumLen - 2)){
					//Append a delimiter onto the string
					enumValues += (", ");
				}
			}
		}

		//Return the filled enum values list
		return enumValues;
	}
}