//Import core Node modules and dependencies
const path = require('path');

export class Bootstrap {
	//Set default class variables
	//public ROOT_DIR = process.env.PWD;
	public static ROOT_DIR:string = "glazer";

	public static getRoot(relativeDir:string):string{
		//

		return null;
	}

	private static deriveRootDir(){
		
	}

	/**
	 * Normalize a file path to the standard path
	 * expected by the target OS
	 * @param pathIn The relative or absolute path to normalize
	 * @return <b>string</b> The normalized path
	 * @author GrzegorzDrozd
	 * @see <a href="https://gist.github.com/GrzegorzDrozd/8433939">https://gist.github.com/GrzegorzDrozd/8433939</a>
	 */
	public static normalizePath(pathIn:string):string{
		//Get the system path separator
		let sysSep:string = (path.sep);
		
		//Replace both types of slash to the appropriate separator
		return (pathIn.replace(new RegExp(/(\\\\|\/){1,}/, 'g'), sysSep));
	}
}

console.log(Bootstrap.ROOT_DIR);
console.log(Bootstrap.normalizePath("\\foo/abc"));