@echo off
::Check if the "node_modules" folder is present
if not exist node_modules (
	::Generate the directory via npm
	echo "node_modules" not found. Creating it...
	call npm install
)

::Run the TypeScript form of the repository, watching for any changes to the code
call npm run-script run-dev