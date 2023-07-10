#!/bin/bash
sudo apt update; sudo apt upgrade -y; sudo apt autoremove -y

sudo apt install curl git ffmpeg -y

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash

cargo binstall zellij

git config --global credential.helper store
git config --global pull.rebase false

git clone https://github.com/in5net/discord-bots.git
gsutil -m cp -r "gs://in5net-vm-transfer/discord-bots" .
cd discord-bots

fnm use

curl -fsSL https://get.pnpm.io/install.sh | sh -
pnpm i --frozen-lockfile --prod