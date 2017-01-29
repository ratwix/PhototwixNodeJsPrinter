#!/usr/bin/python                                                               
import RPi.GPIO as GPIO

controlPin = 16

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(controlPin, GPIO.OUT)
GPIO.output(controlPin, True)

