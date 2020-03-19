#!/usr/bin/env bash
#PRODUCTION INIT SCRIPT
#Define functions
#Usage checkCreateLog <log dir> <log name>
checkCreateLog() {
	#Check if the log file exists
	if [ ! -f $1/$2 ]; then
		#Generate the log file via touch and announce its creation
		echo -e "\"${1}/${2}\" not found. Creating it..."
		touch $1/$2
		chmod 777 $1/$2
	fi
}
#Usage rotate <log dir> <log ext>
rotate() {
	#Get the number of files by extension in the log directory
	logCount=$(find $1 -maxdepth 1 -name *.$2 | wc -l)
	
	#Check if the log directory exists and there is 1 or more log files in the directory
	if [ -d $1 ] && [ $logCount -gt 0 ]; then
		#Get the youngest file in the directory
		youngestFile=$(ls -tp $1 | grep -v /$ | head -1)
	
		#Get the current date
		curDate="$(date -r $1/$youngestFile '+%Y-%m-%d-%H:%M:%S')"
		
		#Zip all of the log files into <today's date>.zip
		zip $1/$curDate.zip $1/*.$2
			
		#Delete the log files
		rm -f $1/*.$2
			
		#Announce the rotate
		echo -e "Rotated all logs in \"${1}/\" into \"${1}/${curDate}.zip\" successfully"
	fi
}

#Check if the logs folder exists
if [ ! -d logs ]; then
	#Generate the directory
	echo -e "\"forever-logs\" not found. Creating it..."
	mkdir logs
	chmod -R 777 logs
fi

#Rotate any old logs
rotate logs log

#Check if "out.log" exists and create it if it doesn't
checkCreateLog logs out.log

#Check if "err.log" exists and create it if it doesn't
checkCreateLog logs err.log