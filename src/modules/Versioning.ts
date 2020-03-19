//Import first-party classes
import StringUtil from "../util/StringUtil";

//Import core Node modules and dependencies
import Git from "git-last-commit";
import NFS from "fs";
import Path from "path";

/**
 * Retrieves version info for the repository
 * using a "VERSION" file and/or the latest repo
 * commit date
 * 
 * @author Spotlightsrule
 */
export default class Versioning {
	//Set default class variables
	private static readonly VERSION_FILE:string = (Path.resolve(__dirname + "../../../VERSION"));
	private static readonly GIT_REPO_FOLDER:string = (Path.resolve(__dirname + "../../../.git"));

	//Set class variables
	/** The absolute location of the project's version file, which contains the current release/snapshot version */
	public versionFile:string;

	/** The absolute location of the project's Git repository */
	public gitRepoFolder:string;

	/**
	 * Constructs a new instance of the class
	 * "Versioning"
	 * @constructs
	 * @param versionFile OPTIONAL: The location of the project's version file
	 * @param gitRepoFolder OPTIONAL: The location of the project's Git repo folder
	 */
	//constructor(versionFile?:string, gitRepoFolder?:string){
	constructor(versionFile?:string){
		//Check if each parameter is defined and assign its value to the corresponding class variable. Otherwise, assign the default value
		this.versionFile = ((typeof versionFile !== "undefined") && (!StringUtil.isNullOrVoid(versionFile)) ? versionFile : Versioning.VERSION_FILE);
		//this.gitRepoFolder = ((typeof gitRepoFolder !== "undefined") && (!StringUtil.isNullOrVoid(gitRepoFolder)) ? versionFile : Versioning.GIT_REPO_FOLDER);

		//Initialize the Git repo folder (temporary until the bug in the upstream repo is fixed)
		this.gitRepoFolder = Versioning.GIT_REPO_FOLDER;
	}

	/**
	 * Retrieves the project version from the
	 * project's version file
	 * @return <b>Promise<string></b> The project's version info
	 */
	public async version():Promise<string> {
		//Try to read the version file using NodeFileSync
		try {
			//Read the version file from its path
			let version:string = (await NFS.readFileSync(this.versionFile, {encoding: "UTF-8"}));

			//Return the version info if the file is populated or null if its not
			return ((version.length >= 1) ? version : null);
		}
		catch(err){
			//Return null because the file couldn't be read
			return null;
		}
	}

	/**
	 * Returns the date of the latest commit
	 * to the local Git repository
	 * @return <b>Promise<Date></b> The date of the last commit
	 */
	public async lastCommit():Promise<Date> {
		//Get the info of the latest commit from the local Git repo
		let latestCommit:Git.Commit = (await this.getLatestCommitInfo());

		//Construct and return a Date object using the committedOn timestamp
		return (new Date(parseInt(latestCommit.committedOn) * 1000));
	}

	//Private utilities
	/**
	 * Retrieves the project's latest commit info
	 * from the local Git repository
	 * @return <b>Promise<Git.Commit></b> The latest Git commit info
	 */
	private async getLatestCommitInfo():Promise<Git.Commit> {
		//Check if the git repo folder exists and return null if it doesn't
		if(!NFS.existsSync(this.gitRepoFolder)) return null;

		//Construct a new promise to return the git info of the latest commit
		return new Promise((result) => {
			//Read the repository info
			Git.getLastCommit(function(err, commit){
				//Check if an error occurred and return null if one did
				if(err) return null;

				//Call the promise's callback variable to return the results (NodeJS is weird af, but this hack works)
				return result(commit);
			}/*, {dst: this.gitRepoFolder}*/); //Bugged TS definitions in the repo
		});
	}
}