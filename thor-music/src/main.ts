import client from './client';
import {
  help,
  loop,
  lyrics,
  move,
  next,
  pause,
  play,
  playlist,
  playnow,
  playshuffle,
  queue,
  remove,
  shuffle,
  soundboard,
  stop
} from './commands';
import players from './players';
import './env';

client
  .on('messageCreate', async message => {
    if (!message.guildId) return;
    if (!message.content.startsWith('-')) return;
    const args = message.content.slice(1).split(' ');

    const params = args.slice(1);
    try {
      switch (args[0]?.toLowerCase()) {
        case 'help':
        case 'h':
          await help(message, params);
          break;
        case 'play':
        case 'p':
          await play(message, params);
          break;
        case 'playnow':
        case 'pn':
          await playnow(message, params);
          break;
        case 'queue':
        case 'q':
          await queue(message, params);
          break;
        case 'next':
        case 'n':
        case 'skip':
          await next(message, params);
          break;
        case 'pause':
          await pause(message, params);
          break;
        case 'shuffle':
          await shuffle(message, params);
          break;
        case 'playshuffle':
        case 'ps':
          await playshuffle(message, params);
          break;
        case 'loop':
          await loop(message, params);
          break;
        case 'move':
        case 'mv':
          await move(message, params);
          break;
        case 'remove':
        case 'rm':
          await remove(message, params);
          break;
        case 'stop':
        case 'clear':
        case 'leave':
          await stop(message, params);
          break;
        case 'soundboard':
        case 'sb':
          await soundboard(message, params);
          break;
        case 'lyrics':
        case 'l':
          await lyrics(message, params);
          break;
        case 'playlist':
        case 'pl':
          await playlist(message, params);
      }
    } catch (error) {
      await message.channel.send(`Error: ${error}`);
    }
  })
  .on('voiceStateUpdate', oldState => {
    if (oldState.channel?.members.size === 1) {
      const guildId = oldState.guild.id;
      const player = players.get(guildId);
      player?.stop();
    }
  });

client.login(process.env.TOKEN);

process.once('beforeExit', () => client.user?.setActivity());
