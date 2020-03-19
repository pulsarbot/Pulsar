//Import core Node modules and dependencies
import * as NFS from "fs";
import * as Path from "path";

/**
 * A series of utility functions for
 * working with asynchronous operations
 * @author Spotlightsrule
 */
export default class AsyncUtil {
	/**
	 * Runs a for loop over an array asynchronously. 
	 * EXAMPLE: AsyncUtil.asyncFor(arr, async(i) => {<stuff>});
	 * @param T Allows generic types to be used
	 * @param array The array to iterate over
	 * @param callback The callback function to call
	 * @return <b>Promise<void></b> The result of the callback function
	 */
	public static async asyncFor<T>(array:T[], callback:any): Promise<void> {
		//Run a regular for loop
		for(let index=0; index<array.length; index++){
			//Wait for the callback function to complete
			await (callback(index, array));
		}
	}

	/**
	 * Runs a forEach loop asynchronously. EXAMPLE:
	 * AsyncUtil.asyncForEach(arr, async(i, callback) => {<stuff>});
	 * @author SeverePain
	 * @param T Allows generic types to be used
	 * @param array The array to iterate over
	 * @param callback The callback function to call
	 * @return <b>Promise<void></b> The result of the callback function
	 */
	public static async asyncForEach<T>(array:T[], callback:any): Promise<void> {
		for(let index = 0; index<array.length; index++){
			await callback(array[index], index, array);
		}
	}

	/**
	 * Runs a for loop iterator asynchronously
	 * EXAMPLE: AsyncUtil.asyncFor(arr, async(i) => {<stuff>});
	 * @param start The number from which to start
	 * @param end The number at which to end
	 * @param callback The callback function to call
	 * @return <b>Promise<void></b> The result of the callback function
	 */
	public static async asyncForIterate(start:number, end:number, callback:any): Promise<void> {
		//Run a regular for loop from the start to the end index
		for(let index=start; index<end; index++){
			//Wait for the callback function to complete
			await (callback(index));
		}
	}

	/**
	 * Recursively "walks" through a directory,
	 * returning all of the file paths that it
	 * finds
	 * @author SirMorfield
	 * @see https://gist.github.com/kethinov/6658166#gistcomment-2934861
	 * @param tDir The directory to recursively list
	 * @param fileList The list of file paths in the directory listing (only required when called recursively)
	 * @return <b>Promise<string[]></b> The recursive directory listing
	 */
	public static async asyncWalk(tDir:string, fileList:string[]=[]):Promise<string[]> {
		//Get the directory listing of the current directory
		const files:string[] = (await NFS.readdirSync(tDir));

		//Loop over the listing
  		for(const file of files){
			//Stat the current path listing
			const stat:NFS.Stats = (await NFS.statSync(Path.normalize(Path.join(tDir, file))));
			
			//Run the function recursively if the statted path is a directory
			if(stat.isDirectory()) fileList = (await AsyncUtil.asyncWalk(Path.normalize(Path.join(tDir, file)), fileList));
			
			//Push the current path onto the paths array if it's not a directory
    		else fileList.push(Path.normalize(Path.join(tDir, file)))
		}

		//Return the filled file list
		return fileList
	}

	/**
	 * Delays the execution of a lambda
	 * until a given time (in milliseconds)
	 * runs out. USAGE EXAMPLE:
	 * delay(3000).then(() => console.log('Hello'));
	 * @param millis The time in milliseconds to delay the resolution of the promise
	 * @author Sébastien Rosset
	 * @see https://stackoverflow.com/a/52408852
	 */
	public static async delay(millis:number):Promise<void> {
		//Return the promise after x milliseconds
		return (await new Promise(resolve => setTimeout(resolve, millis)));
	}
}