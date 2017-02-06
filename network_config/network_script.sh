#!/bin/bash
#Edit /etc/network/interfaces with iface wlan0 inet manual
#Edit dnsmasq.conf for wlan0
#Edit /etc/hostapd/hostapd.conf
#arp -a

service dnsmasq stop
service hostapd stop

ifconfig wlan0 down             #wlan0 - the name of your wireless adapter
sleep 1

ifconfig wlan0 192.168.50.1 up
sleep 1
service dnsmasq start
service hostapd start
