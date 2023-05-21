#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

sudo apt install git curl tmux python-is-python3 ffmpeg -y

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs

sudo npm i -g pnpm

git clone https://github.com/in5net/discord-bots.git

gsutil -m cp -r "gs://in5net-vm-transfer/discord-bots" .

cd discord-bots
pnpm i