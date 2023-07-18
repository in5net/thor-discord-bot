#!/bin/bash
sudo apt update; sudo apt upgrade -y; sudo apt autoremove -y

sudo apt install curl git ffmpeg -y

git config --global credential.helper store
git config --global pull.rebase false

git clone https://github.com/in5net/discord-bots.git
gsutil -m cp -r "gs://in5net-vm-transfer/discord-bots" .
cd discord-bots

fnm use

curl -fsSL https://get.pnpm.io/install.sh | sh -

pnpm i --frozen-lockfile --prod

pnpm i -g pm2
pm2 start "pnpm run start:raya" --wait-ready --listen-timeout 60000