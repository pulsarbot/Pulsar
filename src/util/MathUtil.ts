//Import first-party classes
import StringUtil from "./StringUtil";

/**
 * Defines miscellaneous utilities for use
 * in math operations
 * @author Spotlightsrule
 */
export default class MathUtil {
	/**
	 * Calculates the appropriate measurement
	 * units for a number, given it represents
	 * data size in bytes. Thanks to IBM and
	 * Wikipedia for the values that are used
	 * in the calculation of the unit sizes
	 * @param dataSize The size in bytes
	 * @param convertBytes Sets whether or not to use byte-type measurements (false: 1000b = 1kb; true: 1024b = 1kb)
	 * @param precision The number to which the data should be rounded to
	 * @return <b>string</b> The size downscaled and labeled with appropriate units
	 * @see https://www.ibm.com/support/knowledgecenter/SSQRB8/com.ibm.spectrum.si.doc/fqz0_r_units_measurement_data.html
	 * @see https://en.wikipedia.org/wiki/Binary_prefix
	 */
	public static getDataSize(dataSize:number, convertBytes:boolean, precision:number):string {
		//Set the multiplier based on the convertBytes boolean
		const multiplier = (convertBytes ? 1024 : 1000);

		//Set the units of data measurement and the sizes of each in bytes
		const dataUnits:string[] = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		//Check if the user opted to use byte instead of bit based (ex: 1kb = 1024 bytes rather than 1000 bytes)
		if(convertBytes){
			//Loop over the data units starting from the second element
			for(let i=1; i<dataUnits.length; i++){
				//Squeeze a small i in between the unit to signify the data is using byte conversions
				dataUnits[i] = (StringUtil.insertAt(dataUnits[i], 1, "i"));
			}
		}
		
		//Set a string to contain the units, setting the default value as bytes
		let unitStr = (dataUnits[0]);

		//Check if the data size is smaller than the maximum unit size (multiplier to the power of the highest index in the units array)
		if(dataSize < (Math.pow(multiplier, dataUnits.length))){
			//Loop over the data units stating from kilobytes/kibibytes
			for(let i=1; i<dataUnits.length; i++){
				//Check if the data size is less than the multiplier
				if(dataSize < multiplier){
					//Break out of the loop
					break;
				}

				//Calculate the new size adjusted to fit the data constraint
				dataSize = (MathUtil.preciseRnd((dataSize / (multiplier)), precision));

				//Set the data units to be the current unit in the loop
				unitStr = (dataUnits[i]);
			}
		}

		//Compose and return the data size string with the respective units
		return (`${dataSize} ${unitStr}`);
	}

	/**
	 * Get a random boolean value using
	 * {@code Math.random()}
	 * @return <b>boolean</b> A random boolean value
	 */
	public static getRandomBool():boolean {
		return (Math.random() >= 0.5);
	}
	
	/**
	 * Get a random float between a
	 * minimum and max number using
	 * {@code Math.random()}
	 * @param min The lowest number that can be selected
	 * @param max The highest number that can be selected
	 * @return <b>number</b> A random float value
	 */
	public static getRandomFloat(min:number, max:number):number {
		return (Math.random() * (max - min) + min);
	}

	/**
	 * Get a random integer between a
	 * minimum and max number using
	 * {@code Math.random()}
	 * @param min The lowest number that can be selected
	 * @param max The highest number that can be selected
	 * @return <b>number</b> A random integer
	 */
	public static getRandomInt(min:number, max:number):number {
		return (Math.floor(Math.random() * (max - min + 1) + min));
	}
	
	/**
	 * Check if a given number is in 
	 * the range of two given values
	 * @param numIn The number to check the range of
	 * @param minVal The lower bound for the range check
	 * @param maxVal The upper bound for the range check
	 * @return <b>boolean</b>The status as to whether or not the input number is in range
	 */
	public static numberInRange(numIn:number, minVal:number, maxVal:number):boolean {
		//Check if the input number is in range and return the result
		return (numIn >= minVal && numIn <= maxVal);
	}

	/**
	 * Converts a time in milliseconds 
	 * to its equivalent in days, hours, 
	 * minutes, and seconds
	 * @author Kaimund600
	 * @see https://github.com/Kaimund600
	 * @param millis The time in milliseconds
	 * @return <b>Object{day:number, hours:number, minutes:number, seconds:number}</b> The converted milliseconds time
	 */
	public static msToDHMS(millis:number):{day:number, hours:number, minutes:number, seconds:number} {
		let day:number, hour:number, minute:number, seconds:number;
		seconds = Math.floor(millis / 1000);
		minute = Math.floor(seconds / 60);
		seconds = seconds % 60;
		hour = Math.floor(minute / 60);
		minute = minute % 60;
		day = Math.floor(hour / 24);
		hour = hour % 24;
		
		//Construct and return a new object containing the times
		return {
			day: day,
			hours: hour,
			minutes: minute,
			seconds: seconds
		};
	}

	/**
	 * Rounds a number x to a specific
	 * precision
	 * @author Baeldung
	 * @see https://www.baeldung.com/java-round-decimal-number
	 * @param rndNum The number to round
	 * @param places The precision to round the number to (1 for tenths, 2
	 * for hundredths, etc)
	 * @return <b>number</b> The number rounded to the given precision
	 */
	public static preciseRnd(rndNum:number, places:number):number {
		//Set the rounding scale
		const rndScale = Math.pow(10, places);
    	return (Math.round(rndNum * rndScale) / rndScale);
	}
}