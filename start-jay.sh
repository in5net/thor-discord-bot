#!/bin/sh
until pnpm run start:jay
do
    echo "Restarting bot..."
    sleep 1
done