/* eslint-disable import/no-cycle */
import DiscordBot from '$shared/bot';
import commands from './commands';
import help from './commands/help';
import players from './players';
import './env';

const bot = new DiscordBot(
  'Thor Music',
  '-',
  ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES'],
  process.env.TOKEN
).addCommands([help, ...commands]);
bot.client.on('voiceStateUpdate', oldState => {
  if (
    oldState.channel?.members.has(process.env.DISCORD_BOT_ID || '') &&
    oldState.channel?.members.size === 1
  ) {
    const guildId = oldState.guild.id;
    const player = players.get(guildId);
    player?.stop();
  }
});
export default bot;
