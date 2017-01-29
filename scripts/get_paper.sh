#!/bin/bash
RES=`sudo ./dnpds40 -s 2>&1 | grep 'Native Prints Remaining' | cut -d : -f 3 | tr -d ' '`
echo -n $RES
