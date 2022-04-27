import { random } from '@limitlesspc/limitless';

import DiscordBot from '$shared/bot';
import help from './commands/help';
import commands from './commands';
import { handleMessage } from './commands/wordle';
import responses from './responses';
import { incCount } from '$services/users';
import './env';

const bot = new DiscordBot(
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
      await incCount(author.id, 'saladMundus');
      return;
    }

    if (content.length === 5) await handleMessage(message);

    const args = content.split(' ');

    if (args[0]?.toLowerCase() !== process.env.PREFIX) {
      const msgs: string[] = [];
      let lowercase = content.toLowerCase();
      // Remove @mentions
      lowercase = lowercase.replace(/<@!?\d+>/g, '');
      if (lowercase.includes('ratio')) await incCount(author.id, 'ratio');
      if (['noway', 'norway'].includes(lowercase.replace(' ', ''))) {
        await channel.send(Math.random() < 0.1 ? 'Norway' : 'no way');
        await incCount(author.id, 'noWay');
        return;
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
  });
bot.run();

const nicknames = [
  'CGI Macintosh',
  'CGI MacOS',
  "Cam o' shanter",
  'Camo',
  "Cam'o'Shantero",
  'CJ Big Mac'
];
async function setNickname() {
  try {
    const guild = await bot.client.guilds.fetch(process.env.SHRINE_ID || '');
    const member = await guild.members.fetch(process.env.CG_MACKIE_ID || '');
    const nickname = random(nicknames);
    member.setNickname(nickname);
    console.log(`${nickname} set`);
  } catch (error) {
    console.error(error);
  }
}
bot.onReady(() => {
  setInterval(setNickname, 1000 * 60 * 60);
  setNickname();
});
