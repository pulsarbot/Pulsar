//Import first-party classes
import MathUtil from "./MathUtil";

/**
 * A series of utilities for working with
 * arrays
 * @author Spotlightsrule
 */
export default class ArrayUtil {
	/**
	 * Picks a random array element
	 * @param targetArr The array to fetch the random element from
	 */
	public static getRandomArrElem<T>(targetArr:T[]):T {
		//Pick a random number between 0 and the size of the array
		let randomIndex:number = (MathUtil.getRandomInt(0, (targetArr.length - 1)));

		//Fetch and return the element at the random index
		return (targetArr[randomIndex]);
	}

	/**
	 * Checks if a given object is an array
	 * of a certain datatype
	 * @param targetObj The object to test
	 * @param expectedType The expected datatype that all elements must be
	 * @return <b>boolean</b> Whether the object is an array and all elements are of the expected datatype
	 */
	public static isArrayOf(targetObj:any, expectedType:string|any):boolean {
		//Check if the object is an array
		if(Array.isArray(targetObj)){
			//Loop over every object in the array
			for(let i in targetObj){
				//Create a boolean to store the status as to whether the object is the correct type (false by default)
				let isValidType:boolean = false;

				//Check if the expected type variable is a string
				if(typeof expectedType === "string"){
					//Check if the object is an array of expectedType using typeOf and set the valid type boolean
					isValidType = (typeof targetObj[i] === expectedType);
				}
				else {
					//Check if the object is an array of expectedType using instanceof and set the valid type boolean
					isValidType = (targetObj[i] instanceof expectedType);
				}

				//Check if the current object is of the expected datatype using typeof if the expected type is of type string and instanceof if type object and invert the result
				if(!isValidType){
					//Return false because the current object is not the expected datatype, thus invalidating the whole array
					return false;
				}
			}

			//Return true because the object is an array and every element is of the expected type
			return true;
		}
		else {
			//Immediately return false, as the object is not an array
			return false;
		}
	}

	/**
	 * Constructs a list of the items in
	 * an array, in string form
	 * @param targetArr The array to pull the items from
	 * @param delim The separator to use in between each element
	 */
	public static toList<T>(targetArr:T[], delim:string):string {
		//Create a string to hold the array elements
		let arrayListing:string = "";

		//Loop over the array
		for(let i=0; i<targetArr.length; i++){
			//Append the current element onto the string
			arrayListing += (targetArr[i].toString());
				
			//Ensure that the iterator is not at the end of the array
			if(i < (targetArr.length - 1)){
				//Append the delimiter onto the string
				arrayListing += (delim);
			}
		}

		//Return the filled string
		return arrayListing;
	}
}