#!/bin/sh
until npm start
do
    echo "Restarting"
    sleep 1
done