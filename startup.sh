#!/bin/bash

sudo service dnsmasq stop
sudo service dnsmasq start
sudo service hostapd stop
sudo service hostapd start

cd ~/phototwix/PhototwixNodeJsPrinter
sudo killall npm
sudo killall node
forever index.js &

sleep 3

chromium-browser  --disable --disable-session-crashed-bubble --disable-infobars --disable-translate --disable-infobars --disable-suggestions-service --disable-save-password-bubble --disable-session-crashed-bubble --incognito --kiosk "http://localhost:3000/photoScreen"&

#sleep 10
#
#while true; do
#
#	curl http://127.0.0.1:3000 --max-time 3 --retry-delay 2 --retry 3 --retry-max-time 10 > /dev/null 2> /dev/null
#	if [ $? -ne 0 ];
#	then
#		echo "Site DOWN"
#		killall npm
#		killall node
#		sudo killall npm
#		sudo killall node
#		sleep 2
#		/home/phototwix/node7/node-v7.10.0-linux-x64/bin/node index.js &
#	else
#		echo "Site OK"
#	fi
#	sleep 5
#done
