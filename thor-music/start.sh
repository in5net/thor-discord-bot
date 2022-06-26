#!/bin/sh
until npm run thor-music
do
    echo "Restarting"
    sleep 1
done