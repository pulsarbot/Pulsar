/**
 * Represents a two-element tuple
 * @param <X> First tuple element
 * @param <Y> Second tuple element
 * @author Spotlightsrule
 */
export default class Pair<X, Y> {
	//Set class variables
	private elemOne:X;
	private elemTwo:Y;
	
	//Class constructor
	/**
	 * Constructs a new pair given two elements of any type
	 * @param elemOne Element one of the new pair
	 * @param elemTwo Element two of the new pair
	 */
	constructor(elemOne:X, elemTwo:Y){
		//Assign the class variables from the constructor's parameters
		this.elemOne = elemOne;
		this.elemTwo = elemTwo;
	}

	//Getters
	/**
	 * Returns the first pair element
	 * @return <b>X</b> The first element in the pair
	 */
	public getElemOne():X {
		return this.elemOne;
	}
	
	/**
	 * Returns the second pair element
	 * @return <b>Y</b> The second element in the pair
	 */
	public getElemTwo():Y {
		return this.elemTwo;
	}

	//Setters
	/**
	 * Sets the contents of the first pair element
	 * @param elemOne The new contents of element one
	 */
	public setElemOne(elemOne:X):void {
		this.elemOne = elemOne;
	}
	
	/**
	 * Sets the contents of the second pair element
	 * @param elemTwo The new contents of element two
	 */
	public setElemTwo(elemTwo:Y):void {
		this.elemTwo = elemTwo;
	}
}