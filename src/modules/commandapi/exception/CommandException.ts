/**
 * Defines a generic exception that is 
 * thrown when an issue occurs while 
 * running a command
 * @author Spotlightsrule
 */
export default class CommandException extends Error {
	/**
	 * Constructs a new {@code CommandException}
	 * @constructor
	 * @param excMessage The message to output when this exception is thrown
	 */
	constructor(excMessage:string){
		//Call the superclass with the user provided error message
		super(excMessage);

		//Set the error parameters
		this.name = 'CommandException';
        this.message = excMessage;
        this.stack = (<any>new Error()).stack;
	}

	//toString override
	public toString():string {
		return this.name + ': ' + this.message;
	}
}