#!/usr/bin/env bash
#PRODUCTION DAEMON SPAWNER SCRIPT
#Set the name of the Pulsar daemon
daemonName="PulsarTS"

#Get the number of daemons that are active by the name PulsarTS
daemonCount=$(pm2 list | grep $daemonName | wc -l)

#Check if there is at least one daemon available to stop
if [ $daemonCount -gt 0 ]; then
	#Stop the daemon
	pm2 stop $daemonName
	
	#Discard any old daemon processes
	pm2 delete $daemonName
fi

#Initialize any directories if necessary
sh prod-init.sh

#Spawn the daemon process
pm2 -n $daemonName -f start dist/index.js -o ./logs/out.log -e ./logs/err.log