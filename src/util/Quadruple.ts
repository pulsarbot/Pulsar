/**
 * Represents a four-element tuple
 * @param <A> First tuple element
 * @param <B> Second tuple element
 * @param <C> Third tuple element
 * @param <D> Fourth tuple element
 * @author Spotlightsrule
 */
export default class Quadruple<A, B, C, D> {
	//Set class variables
	private elemOne:A;
	private elemTwo:B;
	private elemThree:C;
	private elemFour:D;
	
	//Class constructor
	/**
	 * Constructs a new quadruple given three elements of any type
	 * @param elemOne Element one of the new quadruple
	 * @param elemTwo Element two of the new quadruple
	 * @param elemThree Element three of the new quadruple
	 * @param elemFour Element four of the new quadruple
	 */
	constructor(elemOne:A, elemTwo:B, elemThree:C, elemFour:D){
		//Assign the class variables from the constructor's parameters
		this.elemOne = elemOne;
		this.elemTwo = elemTwo;
		this.elemThree = elemThree;
		this.elemFour = elemFour;
	}

	//Getters
	/**
	 * Returns the first quadruple element
	 * @return <b>A</b> The first element in the quadruple
	 */
	public getElemOne():A {
		return this.elemOne;
	}
	
	/**
	 * Returns the second quadruple element
	 * @return <b>B</b> The second element in the quadruple
	 */
	public getElemTwo():B {
		return this.elemTwo;
	}
	
	/**
	 * Returns the third quadruple element
	 * @return <b>C</b> The third element in the quadruple
	 */
	public getElemThree():C {
		return this.elemThree;
	}

	/**
	 * Returns the fourth quadruple element
	 * @return <b>D</b> The fourth element in the quadruple
	 */
	public getElemFour():D {
		return this.elemFour;
	}

	//Setters
	/**
	 * Sets the contents of the first quadruple element
	 * @param elemOne The new contents of element one
	 */
	public setElemOne(elemOne:A):void {
		this.elemOne = elemOne;
	}
	
	/**
	 * Sets the contents of the second quadruple element
	 * @param elemTwo The new contents of element two
	 */
	public setElemTwo(elemTwo:B):void {
		this.elemTwo = elemTwo;
	}
	
	/**
	 * Sets the contents of the third quadruple element
	 * @param elemThree The new contents of element three
	 */
	public setElemThree(elemThree:C):void {
		this.elemThree = elemThree;
	}

	/**
	 * Sets the contents of the fourth quadruple element
	 * @param elemFour The new contents of element four
	 */
	public setElemFour(elemFour:D):void {
		this.elemFour = elemFour;
	}
}