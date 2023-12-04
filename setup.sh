#!/bin/bash
sudo apt update; sudo apt upgrade -y; sudo apt autoremove -y

sudo apt install build-essential git ffmpeg -y

git config --global credential.helper store
git config --global pull.rebase false

git clone https://in5net@github.com/in5net/discord-bots.git
gsutil -m cp -r "gs://in5net-vm-transfer/discord-bots" .
cd discord-bots

fnm use

corepack enable
corepack prepare pnpm@latest --activate

pnpm i --prod

pnpm i -g pm2
pm2 start "pnpm run start:raya"