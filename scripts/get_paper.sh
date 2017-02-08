#!/bin/bash
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
RES=`sudo $SCRIPTPATH/dnpds40 -s 2>&1 | grep 'Native Prints Remaining' | cut -d : -f 3 | tr -d ' '`
echo -n $RES
