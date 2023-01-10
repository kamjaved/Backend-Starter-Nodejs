#!/bin/sh

if pgrep -x "mosquitto" > /dev/null
  then 
    echo 1
  else
    echo 0
fi
