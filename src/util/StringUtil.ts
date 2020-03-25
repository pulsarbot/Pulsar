//Import core Node modules and dependencies
import * as util from "util";
import MathUtil from "./MathUtil";

/**
 * A series of functions for working
 * with strings
 * @author Spotlightsrule
 */
export default class StringUtil {
	/**
	 * Clones a string x amount of times
	 * @param cloneTarget The string to clone
	 * @param cloneCount The amount of times to clone the target
	 * @return <b>string</b> The new cloned string
	 */
	public static cloneStr(cloneTarget:string, cloneCount:number):string {
		//Initialization
		let outStr:string = "";
		
		//Check if the clone count is greater than or equal to one
		if(cloneCount >= 1){
			//Dupe the string
			outStr = util.format("%0" + cloneCount + "d", 0).replace("0", cloneTarget);
		}
		
		//Return the string with the number of desired clones
		return outStr;
	}
	
	/**
	 * Check if a string equals any element in
	 * a given {@code ArrayList}. Useful in cases where
	 * a string can equal multiple objects.
	 * @param tStr The string to use in the operation
	 * @param equalTargets A list of all objects that the input string can equal
	 * @param ignoreCase Specifies whether or not to ignore case in the comparison operation
	 * @return <b>boolean</b> The status as to whether or not the input string equals any object in the passed {@code ArrayList}
	 */
	public static equalsAny(tStr:string, equalTargets:string[], ignoreCase:boolean):boolean {
		//Loop through the ArrayList of targets
		for(let i=0; i<equalTargets.length; i++){
			//Check if case should be ignored
			if(ignoreCase){
				//Transform both the target element and the input string to lowercase
				tStr = tStr.toLowerCase();
				equalTargets[i] = equalTargets[i].toString().toLowerCase();
			}

			//Check if the input string equals the target element
			if(tStr === equalTargets[i]){
				//Return true because the string matches at least one equal target
				return true;
			}
		}
		
		//Return false because the input string doesn't equal any of the equal targets
		return false;
	}

	/**
	 * Splice a string into an existing
	 * string at a given index
	 * @author GeeksForGeeks
	 * @param tStr The string to modify
	 * @param index The index to insert the new string at
	 * @param insertionStr The string to insert at the desired index
	 * @return <b>string</b> The new string that resulted from splicing the insertion string into the original
	 */
	public static insertAt(tStr:string, index:number, insertionStr:string):string {
		//Create a new string to insert the new element into 
		let newString:string = null;
			
		//Substring the original starting from 0 to the index, insert the new string, and substring from the index to the end of the original
		newString = (tStr.substring(0, index) + insertionStr + tStr.substring(index)); 
		  
		//Return the modified string 
		return newString; 
	}
	
	/**
	 * Check if a given string is of a 
	 * null value. This is different from 
	 * {@code isNullOrVoid}, as this method will
	 * return {@code true} if and ONLY IF the input
	 * string is null.
	 * @param tStr The target string
	 * @return <b>boolean</b> The status of whether or 
	 * not the given string is null
	 * @see isNullOrVoid
	 */
	public static isNull(tStr:string):boolean {
		//Check if the string is null or undefined
		if(tStr != null && tStr){
			//String has a value tied to it or is simply blank
			return false;
		}
		else {
			//String is null
			return true;
		}
	}
	
	/**
	 * Check if a given string is of a 
	 * null value or is simply blank. This is 
	 * different from {@code isNull}, as this
	 * method will also return {@code true} if 
	 * the input string is empty.
	 * @param tStr The target string
	 * @return <b>boolean</b> The status of whether or 
	 * not the given string is null or empty
	 * @see isNull
	 */
	public static isNullOrVoid(tStr:string):boolean {
		//Check if the string is null, empty, or undefined
		if(tStr !== null && tStr && tStr.length >= 1){
			//String has a value tied to it
			return false;
		}
		else {
			//String is null or blank
			return true;
		}
	}
	
	/**
	 * Add ordinal suffixes to numbers (1st, 2nd, 3rd, etc)
	 * @param numIn The number to add the suffix to
	 * @return <b>String</b> The resulting number with ordinal suffix
	 */
	public static suffixOrdinalNum(numIn:number):string {
		//Set the list of valid ordinal suffixes
		const suffixList:string[] = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
		
		//Decide which suffix to add
		switch(numIn % 100){
			//11, 12, 13 do not follow typical conventions (1st, 2nd, 3rd), so they always get "th"
			case 11:
			case 12:
			case 13:
				return numIn + "th";
			//Return the corresponding ordinal suffix depending on the number's ones place digit
			default:
				return numIn + suffixList[numIn % 10];
		}
	}

	/**
	 * Returns a phrase as an acronym
	 * (eg: hello world becomes hw)
	 * @param strIn The string to turn into an acronym
	 * @return <b>string<b> The resulting acronym
	 */
	public static toAcronym(strIn:string):string{
		//Split the string at each whitespace or space char
		let splitStr:string[] = strIn.split((/[\u0009\u000A\u000B\u000C\u000D\u0020\u0085\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000]/), -1);
	
		//Create a string for later
		let acroStr:string = "";
		
		//Loop through the string pieces
		for(let i=0; i<splitStr.length; i++){
			//Check if the current element's length is greater than or equal to 1 (avoids going out of bounds)
			if(splitStr[i].length >= 1){
				//Append the first char onto the string
				acroStr += (splitStr[i].charAt(0));
			}
		}
		
		//Return the filled string
		return acroStr;
	}

	/**
	 * Adds a zero to the beginning of a number if
	 * it's (10 < x < 0) or (0 < x < -10)
	 * @param inputNumber The number to add the prefix to
	 * @return <b>string</b> The input number, prefixed with a zero or not
	 */
	public static zeroPrefix(inputNumber:number):string {		
		//Convert the input number to a string
		let numStr:string = inputNumber.toString();

		//CONDITION ONE: Check if the number is less than 10 but greater than 0
		if((inputNumber > 0) && (inputNumber < 10)){
			//Prefix the number with a zero
			numStr = (0 + numStr)
		}

		//CONDITION TWO: Check if the number is less than 0 but greater than -10
		if((inputNumber > -10) && (inputNumber < 0)){
			//Prefix the number with a zero
			numStr = (numStr.charAt(0) + 0 + numStr.substring(1));
		}

		//Return the stringified number, modified or not
		return numStr;
	}
}