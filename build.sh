#!/bin/sh
#Check if the "node_modules" folder is present
if [ ! -d node_modules ]; then
	#Generate the directory via npm
	echo -e "\"node_modules\" not found. Creating it..."
	npm install
fi

#Compile the repository to JS
npm run-script build

#Run the built JS module
npm run-script run-js