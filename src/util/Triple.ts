/**
 * Represents a three-element tuple
 * @param <X> First tuple element
 * @param <Y> Second tuple element
 * @param <Z> Third tuple element
 * @author Spotlightsrule
 */
export default class Triple<X, Y, Z> {
	//Set class variables
	private elemOne:X;
	private elemTwo:Y;
	private elemThree:Z;
	
	//Class constructor
	/**
	 * Constructs a new triple given three elements of any type
	 * @param elemOne Element one of the new triple
	 * @param elemTwo Element two of the new triple
	 * @param elemThree Element three of the new triple
	 */
	constructor(elemOne:X, elemTwo:Y, elemThree:Z){
		//Assign the class variables from the constructor's parameters
		this.elemOne = elemOne;
		this.elemTwo = elemTwo;
		this.elemThree = elemThree;
	}

	//Getters
	/**
	 * Returns the first triple element
	 * @return <b>X</b> The first element in the triple
	 */
	public getElemOne():X {
		return this.elemOne;
	}
	
	/**
	 * Returns the second triple element
	 * @return <b>Y</b> The second element in the triple
	 */
	public getElemTwo():Y {
		return this.elemTwo;
	}
	
	/**
	 * Returns the third triple element
	 * @return <b>Z</b> The third element in the triple
	 */
	public getElemThree():Z {
		return this.elemThree;
	}

	//Setters
	/**
	 * Sets the contents of the first triple element
	 * @param elemOne The new contents of element one
	 */
	public setElemOne(elemOne:X):void {
		this.elemOne = elemOne;
	}
	
	/**
	 * Sets the contents of the second triple element
	 * @param elemTwo The new contents of element two
	 */
	public setElemTwo(elemTwo:Y):void {
		this.elemTwo = elemTwo;
	}
	
	/**
	 * Sets the contents of the third triple element
	 * @param elemThree The new contents of element three
	 */
	public setElemThree(elemThree:Z):void {
		this.elemThree = elemThree;
	}
}