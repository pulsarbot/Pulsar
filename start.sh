#!/bin/sh
#Check if the "node_modules" folder is present
if [ ! -d node_modules ]; then
	#Generate the directory via npm
	echo -e "\"node_modules\" not found. Creating it..."
	npm install
fi

#Run the TypeScript form of the repository, watching for any changes to the code
npm run-script run-dev