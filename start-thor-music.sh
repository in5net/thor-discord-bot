#!/bin/sh
until pnpm run thor-music
do
    echo "Restarting bot..."
    sleep 1
done