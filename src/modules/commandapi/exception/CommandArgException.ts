/**
 * Defines an exception that is thrown when the
 * argument count for a command is out of the
 * acceptable range for that command. IMPORTANT:
 * This exception MUST be checked for via {@code try}
 * blocks, as this exception is used to ensure
 * argument counts for commands. Please check for
 * it or your application will crash when 
 * given a bad argument count
 * @author Spotlightsrule
 */
export default class CommandArgException extends Error {
	/**
	 * Constructs a new {@code CommandArgException}
	 * @constructor
	 * @param excMessage The message to output when this exception is thrown
	 */
	constructor(excMessage:string){
		//Call the superclass with the user provided error message
		super(excMessage);

		//Set the error parameters
		this.name = 'CommandArgException';
        this.message = excMessage;
        this.stack = (<any>new Error()).stack;
	}

	//toString override
	public toString():string {
		return this.name + ': ' + this.message;
	}
}