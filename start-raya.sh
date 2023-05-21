#!/bin/sh
until pnpm run start:raya
do
    echo "Restarting bot..."
    sleep 1
done