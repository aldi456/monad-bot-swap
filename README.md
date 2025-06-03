# buka termux
pkg update && pkg upgrade
pkg install git -y
# clone git
git clone https://github.com/aldi456/monad-bot.git
cd monad-bot-swap
# install node js
pkg install nodejs -y
# Install Dependency Project
npm install ethers dotenv
# buat file .env (untuk private key)
nano .env
PRIVATE_KEY=0x... # isi dengan private key wallet kamu
PROVIDER_URL=https://testnet-rpc.monad.xyz
ROUTER_ADDRESS=0x88B96aF200c8a9c35442C8AC6cd3D22695AaE4F0
CTRL O simpan
CTRL X Keluar
# run bot
node mon-usdc.js
