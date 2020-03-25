//Import first-party classes
import ArrayUtil from "../../util/ArrayUtil";
import AsyncUtil from "../../util/AsyncUtil";
import Command from "../../modules/commandapi/Command";
import { CommandCategory } from "../../modules/commandapi/CommandCategory";
import Console from "../../modules/commandapi/interpreter/Console";
import ICommandField, { CommandField } from "../../modules/commandapi/ICommandField";
import MathUtil from "../../util/MathUtil";
import Pulsar from "../../handlers/Pulsar";

//Import core Node modules and dependencies
import Discord from "discord.js";
import Faker from "faker";
import RandomColor from "randomcolor";

/**
 * "Doxxes" a user from their Discord
 * username
 * @author Spotlightsrule
 */
export default class FakeDox extends Command {
	//Define the fields for the command
	private static commandFields = new CommandField(
		"fakedox", //NAME
		"\"Doxxes\" a user from their Discord username", //DESCRIPTION
		"fakedox [username/ID]", //USAGE - [] = MANDATORY () = OPTIONAL
		["fakedox [@severepain]", "fakedox [123456789012345678]"], //EXAMPLES
		CommandCategory.FUN, //CATEGORY
		1, //MIN ARGS
		1, //MAX ARGS
		["EMBED_LINKS"], //REQUIRED PERMS
		false, //BOT OWNER ONLY
		false, //TRUSTED ONLY
		[], //BLACKLISTED USERS
		[], //WHITELISTED GUILDS
		false, //DELETE ON FINISH
		true, //SIMULATE TYPING
		10000, //SPAM TIMEOUT
		["dox", "fdox", "vortex"] //ALIASES
	);

	/**
	 * Constructs a new instance of the "FakeDox"
	 * command class
	 * @param cmdConsole The interpreter's console instance
	 */
	constructor(cmdConsole:Console){
		//Call the superclass with the command fields
		super(FakeDox.commandFields, cmdConsole);
	}

	public async run(botClient:Pulsar, message:Discord.Message, args:string[], calledName:string):Promise<any> {
		//Assert the argument count
		super.assertArgCount(args.length, message);

		//Create a variable to hold the mentioned user and try to cast the first argument to a Discord user
		let mentioned:Discord.User = null;

		//Try to fetch a user by their ID
		try {
			//Fetch the user by ID and assign it to the mentioned variable
			mentioned = (await botClient.fetchUser(args[0].replace(`<@`, '').replace(`>`, '').replace(`!`, ``)));
		}
		catch {
			//Warn that the argument is invalid
			let bagArgWarn:Discord.Message = (await message.reply(`:x: Invalid argument passed! The correct usage is \`${botClient.config.prefix}${FakeDox.commandFields.usage}\``));

			//Queue the message for deletion after 5s
			await (AsyncUtil.delay(5000).then(async () => {
				//Delete the bad argument warning
				await (bagArgWarn.delete());
			}));

			//Break out of the function
			return (Promise.resolve(false));
		}

		//Check if the user to dox is the sender or the bot itself
		if((mentioned.id === message.author.id) || (mentioned.id === botClient.user.id)){
			//Warn that the mentioned user can't be doxxed
			let badUsrWarn:Discord.Message = (await message.reply(`:x: HEY! Sorry, but you can't dox that person.`));

			//Queue the message for deletion after 5s
			await (AsyncUtil.delay(5000).then(async () => {
				//Delete the bad argument warning
				await (badUsrWarn.delete());
			}));

			//Break out of the function
			return (Promise.resolve(false));
		}

		//Generate fake info for the person that was mentioned
		const fakeInfo:{name:string, dob:Date, phones:string[], emails:string[], ip:string, color:string, addr1:string, addr2:string, addr3:string} = (FakeDox.generate());

		//Announce the "doxxing of the user"
		let doxAlert:Discord.Message = (await message.channel.send(`:hourglass: Doxxing <@${mentioned.id}>. Please wait...`));

		//Queue the message for editing
		await (AsyncUtil.delay((MathUtil.getRandomInt(3, 10) * 1000)).then(async () => {
			//Edit the message to reflect that the dox was successful
			await (doxAlert.edit(`:white_check_mark: Doxxed <@${mentioned.id}> successfully!`));
		}));

		//Generate an embed for the dox info
		let doxEmbed:Discord.MessageEmbed = (new Discord.MessageEmbed()
			.setColor(fakeInfo.color)
			.setTitle(`(Fake) Dox info for user ${mentioned.tag}`)
			.setAuthor("Pulsar Doxxing API", botClient.user.displayAvatarURL())
			.setThumbnail(`${mentioned.avatarURL()}`)
			.addField("Name", fakeInfo.name)
			.addField("DOB", fakeInfo.dob)
			.addField("Address", `${fakeInfo.addr1}\n${fakeInfo.addr2}\n${fakeInfo.addr3}`)
		);

		//Loop over the fake emails
		for(let i=0; i<fakeInfo.emails.length; i++){
			//Add the current email as an inline field
			doxEmbed.addField(`Email #${i+1}`, fakeInfo.emails[i], true);
		}

		//Clear the inline property of the previous field by adding a non-inline field in the form of the IP address
		doxEmbed.addField("IP Address", `${fakeInfo.ip}`, false);

		//Loop over the fake phone numbers
		for(let i=0; i<fakeInfo.phones.length; i++){
			//Add the current phone number as an inline field
			doxEmbed.addField(`Phone Number #${i+1}`, fakeInfo.phones[i], true);
		}

		//Add the tail fields to the embed
		doxEmbed.setTimestamp().setFooter(`Requested by: ${message.author.username}`, `${message.author.avatarURL()}`);

		//Send the embed
		await (message.channel.send(doxEmbed));

		//End execution by resolving the promise
		return Promise.resolve(true);
	}

	//Private utilities
	/**
	 * Generates fake information about a person
	 * given a valid locale. Depending on the locale, 
	 * the format of the address can change. This is to
	 * ensure that the result is at least somewhat more
	 * believable. See the following site for a complete
	 * reference on international address formats:
	 * https://www.bitboost.com/ref/international-address-formats
	 * @param locale OPTIONAL: The locale to use when generating the fake info
	 * @return <b>Object</b> The fake information
	 */
	private static generate(locale?:string):{name:string, dob:Date, phones:string[], emails:string[], ip:string, color:string, addr1:string, addr2:string, addr3:string} {
		//Set the available locales that can be selected as well as the formats for the address and the country name that it belongs to (<code>, <country name>, <address line 1>, //<apartment>, <address line 2>)
		const fakerLocales:readonly string[][] = [
			["cz", "Czech Republic", "${streetName} ${streetNum}", "/${aptUnit}", "${postal} ${city}"], 
			["de", "Germany", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}"], 
			["de_AT", "Austria", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}"],
			["de_CH", "Switzerland", "${streetName} ${streetNum}", "/${aptUnit}", "${postal} ${city}"],
			["en_AU", "Australia", "${streetNum} ${streetName}", " ${aptUnit}", "${city}, ${state} ${postal}"],
			["en_CA", "Canada", "${streetNum} ${streetName}", " ${aptUnit}", "${city}, ${state} ${postal}"],
			["en_GB", "United Kingdom", "${streetNum} ${streetName}", " ${aptUnit}", "${city}, ${county} ${postal}"], 
			["en_IE", "Ireland", "${streetNum} ${streetName}", " ${aptUnit}", "${city}, ${county} ${postal}"], 
			["en_IND", "India", "${streetNum} ${streetName}", " ${aptUnit}", "${city}, ${state} ${postal}"], 
			["en_US", "United States", "${streetNum} ${streetName}", " ${aptUnit}", "${city}, ${state} ${postal}"], 
			["en_ZA", "South Africa", "${streetNum} ${streetName}", " ${aptUnit}", "${city} ${postal}"], 
			["es", "Spain", "${streetName} ${streetNum}", ", ${aptUnit}", "${postal} ${city}"], 
			["es_MX", "Mexico", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}, ${state}"], 
			["fr", "France", "${streetNum} ${streetName}", " ${aptUnit}", "${postal} ${city}"], 
			["id_ID", "Indonesia", "${streetName} ${streetNum}", " ${aptUnit}", "${city} ${postal}"], 
			["it", "Italy", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}, ${state}"], 
			["nb_NO", "Norway", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}"], 
			["nep", "Nepal", "${streetNum} ${streetName}", " ${aptUnit}", "${city} ${postal}"],  
			["nl", "Netherlands", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}"],  
			["pl", "Poland", "${streetNum} ${streetName}", " ${aptUnit}", "${postal} ${city}"],  
			["sk", "Slovakia", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}"],  
			["sv", "Sweden", "${streetNum} ${streetName}", ", ${aptUnit}", "${postal} ${city}"],  
			["tr", "Turkey", "${streetName} ${streetNum}", " ${aptUnit}", "${postal} ${city}"],  
			["vi", "Vietnam", "${streetNum}, ${streetName}", " ${aptUnit}", "${city} ${postal}"],  
		];

		//Set the index of the chosen locale
		let localeInd:number = -1;

		//Check if the locale string is defined
		if((typeof locale !== null) && (locale)){
			//Loop over the list of available locales
			for(let i=0; i<fakerLocales.length; i++){
				//Check if the input locale matches the current available locale
				if(locale.toLowerCase() === fakerLocales[i][0].toLowerCase()){
					//Set the selected locale index to i
					localeInd = i;

					//Break out of the loop
					break;
				}
			}
		}

		//Check if a valid locale was not found and choose a random locale if the input is invalid
		if(localeInd === -1) (localeInd = (MathUtil.getRandomInt(0, (fakerLocales.length - 1))));

		//Set the locale for Faker.JS from the locale array
		Faker.locale = (fakerLocales[localeInd][0]);

		//PERSONAL DETAILS
		//Create a field to hold the fake name
		let fakeName:string = null;

		//Loop while the name field is null (solves an internal bug with faker.js)
		while((fakeName === null) || (fakeName.length < 1)){
			//Generate a fake name (first & last)
			fakeName = (Faker.name.findName());
		}

		//Generate a fake birthday
		const fakeDOB:Date = (FakeDox.randomDate((new Date().getFullYear() - 13), (new Date().getFullYear() - 57)));

		//Create an array to hold fake phone numbers
		const phoneNums:string[] = [];

		//Loop 1-3 times to generate the fake phone numbers
		for(let i=0; i<(MathUtil.getRandomInt(1, 3)); i++){
			//Add a new phone number
			phoneNums.push(Faker.phone.phoneNumber());
		}

		//Create an array to hold fake email addresses
		const emailAddrs:string[] = [];

		//Loop 1-3 times to generate the fake emails
		for(let i=0; i<(MathUtil.getRandomInt(1, 3)); i++){
			//Add a new email address
			emailAddrs.push(Faker.internet.email());
		}

		//Generate a fake IP address
		const ipAddr:string = (Faker.internet.ip());

		//Generate a fake favorite color
		const favColor:string = (RandomColor());


		//ADDRESS GENERATION
		//Set the syntax for the first address line and tack on the apartment number syntax based on the value of a random boolean
		let fakeAddrL1:string = (`${fakerLocales[localeInd][2]}${MathUtil.getRandomBool() ? (`${fakerLocales[localeInd][3]}`) : ""}`);

		//Replace the placeholders in the first address line
		const streetAddrFull:string = (Faker.address.streetAddress()); //Temporary variable, as there is no field for the street number
		fakeAddrL1 = (fakeAddrL1.replace("${aptUnit}", Faker.address.secondaryAddress()).replace("${streetName}", Faker.address.streetName()).replace("${streetNum}", (streetAddrFull.substring(0, streetAddrFull.indexOf(" ")))));

		//Set the syntax for the second address line and replace the placeholders
		const fakeAddrL2:string = ((`${fakerLocales[localeInd][4]}`).replace("${city}", Faker.address.city()).replace("${county}", Faker.address.county()).replace("${postal}", Faker.address.zipCode()).replace("${state}", Faker.address.state()));

		//Set the country from the locale array
		const fakeCountry:string = (fakerLocales[localeInd][1]);

		//Construct and return an object containing the fake data
		return {
			name: fakeName,
			dob: fakeDOB,
			phones: phoneNums,
			emails: emailAddrs,
			ip: ipAddr,
			color: favColor,
			addr1: fakeAddrL1,
			addr2: fakeAddrL2,
			addr3: fakeCountry
		}
	}

	/**
	 * Generates a random date between 
	 * year x and year y
	 * @param fromYear The year to start at
	 * @param toYear The year to end at
	 * @return <b>Date</b> The resulting random date
	 */
	private static randomDate(fromYear:number, toYear:number): Date {
		//Get the current date
		let curDate:Date = new Date();
	
		//Set the year randomly using a number between fromYear and toYear
		curDate.setFullYear(MathUtil.getRandomInt(fromYear, toYear));
	
		//Set the month randomly (0-11)
		curDate.setMonth(MathUtil.getRandomInt(0,11));
	
		//Set the date randomly (1 to 31)
		curDate.setDate(MathUtil.getRandomInt(1, 31));
	
		//Set the hour randomly (0 to 23)
		curDate.setHours(MathUtil.getRandomInt(0, 23));
	
		//Set the minute randomly (0 to 59)
		curDate.setMinutes(MathUtil.getRandomInt(0, 59));
	
		//Set the second randomly (0 to 59)
		curDate.setSeconds(MathUtil.getRandomInt(0, 59));
	
		//Return the now random date
		return curDate;
	}
}