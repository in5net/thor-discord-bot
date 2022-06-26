#!/bin/sh
until pnpm run thor-music
do
    echo "Restarting"
    sleep 1
done