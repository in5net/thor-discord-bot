#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

sudo apt install git curl tmux -y
# xvfb libgl1-mesa-dev python-is-python3

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm i -g pnpm

git clone https://github.com/limitlesspc/discord-bots.git

gsutil -m cp -r \
  "gs://in5net-vm-transfer/.npmrc" \
  "gs://in5net-vm-transfer/discord-bots" \
  .

cd discord-bots
pnpm run setup