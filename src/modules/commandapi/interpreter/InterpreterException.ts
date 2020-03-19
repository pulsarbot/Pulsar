/**
 * Defines a generic exception that is 
 * thrown when an issue occurs in the
 * interpreter
 * @author Spotlightsrule
 */
export default class InterpreterException extends Error {
	/**
	 * Constructs a new {@code InterpreterException}
	 * @constructor
	 * @param excMessage The message to output when this exception is thrown
	 */
	constructor(excMessage:string){
		//Call the superclass with the user provided error message
		super(excMessage);

		//Set the error parameters
		this.name = 'InterpreterException';
		this.message = excMessage;
		this.stack = (<any>new Error()).stack;
	}

	//toString override
	public toString():string {
		return this.name + ': ' + this.message;
	}
}