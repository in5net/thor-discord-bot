#!/bin/bash
until xvfb-run -s "-ac -screen 0 1280x1024x24" pnpm run thor
do
    echo "Restarting"
    sleep 1
done