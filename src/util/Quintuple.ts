/**
 * Represents a five-element tuple
 * @param <A> First tuple element
 * @param <B> Second tuple element
 * @param <C> Third tuple element
 * @param <D> Fourth tuple element
 * @param <E> Fifth tuple element
 * @author Spotlightsrule
 */
export default class Quintuple<A, B, C, D, E> {
	//Set class variables
	private elemOne:A;
	private elemTwo:B;
	private elemThree:C;
	private elemFour:D;
	private elemFive:E;
	
	//Class constructor
	/**
	 * Constructs a new quintuple given three elements of any type
	 * @param elemOne Element one of the new quintuple
	 * @param elemTwo Element two of the new quintuple
	 * @param elemThree Element three of the new quintuple
	 * @param elemFour Element four of the new quintuple
	 * @param elemFive Element five of the new quintuple
	 */
	constructor(elemOne:A, elemTwo:B, elemThree:C, elemFour:D, elemFive:E){
		//Assign the class variables from the constructor's parameters
		this.elemOne = elemOne;
		this.elemTwo = elemTwo;
		this.elemThree = elemThree;
		this.elemFour = elemFour;
		this.elemFive = elemFive;
	}

	//Getters
	/**
	 * Returns the first quintuple element
	 * @return <b>A</b> The first element in the quintuple
	 */
	public getElemOne():A {
		return this.elemOne;
	}
	
	/**
	 * Returns the second quintuple element
	 * @return <b>B</b> The second element in the quintuple
	 */
	public getElemTwo():B {
		return this.elemTwo;
	}
	
	/**
	 * Returns the third quintuple element
	 * @return <b>C</b> The third element in the quintuple
	 */
	public getElemThree():C {
		return this.elemThree;
	}

	/**
	 * Returns the fourth quintuple element
	 * @return <b>D</b> The fourth element in the quintuple
	 */
	public getElemFour():D {
		return this.elemFour;
	}

	/**
	 * Returns the fifth quintuple element
	 * @return <b>E</b> The fifth element in the quintuple
	 */
	public getElemFive():E {
		return this.elemFive;
	}

	//Setters
	/**
	 * Sets the contents of the first quintuple element
	 * @param elemOne The new contents of element one
	 */
	public setElemOne(elemOne:A):void {
		this.elemOne = elemOne;
	}
	
	/**
	 * Sets the contents of the second quintuple element
	 * @param elemTwo The new contents of element two
	 */
	public setElemTwo(elemTwo:B):void {
		this.elemTwo = elemTwo;
	}
	
	/**
	 * Sets the contents of the third quintuple element
	 * @param elemThree The new contents of element three
	 */
	public setElemThree(elemThree:C):void {
		this.elemThree = elemThree;
	}

	/**
	 * Sets the contents of the fourth quintuple element
	 * @param elemFour The new contents of element four
	 */
	public setElemFour(elemFour:D):void {
		this.elemFour = elemFour;
	}

	/**
	 * Sets the contents of the fifth quintuple element
	 * @param elemFive The new contents of element five
	 */
	public setElemFive(elemFive:E):void {
		this.elemFive = elemFive;
	}
}