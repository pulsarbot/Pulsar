@echo off
::Check if the "node_modules" folder is present
if not exist node_modules (
	::Generate the directory via npm
	echo "node_modules" not found. Creating it...
	call npm install
)

::Compile the repository to JS
call npm run-script build

::Run the built JS module
call npm run-script run-js