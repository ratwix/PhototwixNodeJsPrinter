#!/bin/bash

sudo service dnsmasq stop
sudo service dnsmasq start
sudo service hostapd stop
sudo service hostapd start

cd ~/phototwix/PhototwixNodeJsPrinter
sudo killall npm
sudo killall node
npm start &

sleep 3

chromium-browser  --disable --disable-session-crashed-bubble --disable-infobars --disable-translate --disable-infobars --disable-suggestions-service --disable-save-password-bubble --disable-session-crashed-bubble --incognito --kiosk "http://localhost:3000/photoScreen"&
