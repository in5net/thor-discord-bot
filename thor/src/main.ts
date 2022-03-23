import DiscordBot from '$shared/bot';
import help from './commands/help';
import commands from './commands';
import { handleMessage } from './commands/wordle';
import responses from './responses';
import { incNoWayCount, incSaladMundusCount } from '$services/users';
import './env';

new DiscordBot(
  'Thor',
  `${process.env.PREFIX} `,
  ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES'],
  process.env.TOKEN
)
  .addCommands([help, ...commands])
  .onMessage(async message => {
    const { content, channel, author } = message;
    if (
      ['among', 'imposter', 'imposta', 'amogus', 'mongus'].some(str =>
        content.toLowerCase().includes(str)
      )
    ) {
      await message.delete().catch();
      let msg = 'salad mundus detected';
      if (Math.random() < 0.3)
        msg += ` gave 1 strike to <@${message.author.id}>`;
      await channel.send(msg).catch();
      await incSaladMundusCount(author.id);
      return;
    }

    if (content.length === 5) await handleMessage(message);

    const args = content.split(' ');

    if (args[0]?.toLowerCase() !== process.env.PREFIX) {
      const msgs: string[] = [];
      let lowercase = content.toLowerCase();
      // Remove @mentions
      lowercase = lowercase.replace(/<@!?\d+>/g, '');
      if (lowercase.replace(' ', '') === 'noway') {
        await channel.send(Math.random() < 0.1 ? 'Norway' : 'no way');
        await incNoWayCount(author.id);
        return 0;
      }
      if (channel.type !== 'DM' && !channel.name.includes('thor')) {
        if (channel.name.includes('general')) {
          if (Math.random() > 0.5) return;
        } else return;
      }

      for (const [words, msg] of responses.entries()) {
        const included = words.some(word => lowercase.includes(word));
        if (included) msgs.push(msg);
      }

      if (msgs.length) await channel.send(msgs.join(' '));
      return 0;
    }
    return undefined;
  })
  .run();
