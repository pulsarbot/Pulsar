//Import core Node modules and dependencies
import * as fs from "fs";

/**
 * Sends a message to the console and/or
 * a designated logging file
 * @author Spotlightsrule
 */
export default class Console {
	//Set class variables
	private logOutputPath;
	
	//Class constructors
	/**
	 * Constructs a console instance
	 * @constructor
	 * @param logOutputPath OPTIONAL: The path to log incoming console messages
	 */
	constructor(logOutputPath?:string){
		//Assign the class variables from the constructor's parameters
		this.logOutputPath = logOutputPath;
	}
	
	//TODO: rotate logs from the previous day
	public out(soutContents:string):void {
		//Check if the log output path is not null
		if(this.logOutputPath){
			//Strip all ANSI escape sequences from the string
			soutContents = soutContents.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

			//Create a WriteStream to write the console output to a file, appending to the file if it exists
			let consoleFileStream:fs.WriteStream = (fs.createWriteStream(this.logOutputPath, {flags: 'a' }));

			//Write the message to the file, appending a line ending to the end (LF only because UNIX > Windows)
			consoleFileStream.write(soutContents + "\n");

			//Close the stream to avoid memory leaks
			consoleFileStream.close();
		}
		
		//Send the message to the console via console.log
		console.log(soutContents);
	}
}