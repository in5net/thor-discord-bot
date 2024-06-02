#!/bin/sh
while true; do
	xvfb-run -s "-ac -screen 0 1280x1024x24" pnpm start
	sleep 1
done
