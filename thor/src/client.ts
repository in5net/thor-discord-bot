import { Client } from 'discord.js';

const client = new Client({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'DIRECT_MESSAGES'
  ],
  partials: ['CHANNEL']
}).once('ready', () => console.log('✅ Thor Bot is ready!'));

export default client;
