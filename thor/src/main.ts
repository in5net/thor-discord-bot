import { random } from '@limitlesspc/limitless';

import './env';
import DiscordBot from '$shared/bot';
import help from './commands/help';
import commands from './commands';
import { handleMessage } from './commands/wordle';
import responses from './responses';
import { incCount } from '$services/users';

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
      await incCount(author.id, 'salad_mundus');
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

const first = [
  'CG',
  'CGI ',
  'Cam ',
  "Cam o'",
  "Cam'o'",
  'CJ ',
  'Cameraman ',
  'Cheese touch '
];
const last = [
  'Macintosh',
  'MacOS',
  'shanter',
  'Shantero',
  'Big Mac',
  'Macaroon',
  'Macaronie'
];

const { SHRINE_ID = '', LIMITLESS_PC_ID = '', CG_MACKIE_ID = '' } = process.env;

async function getMember(memberId: string) {
  let guild = bot.client.guilds.cache.get(SHRINE_ID);
  if (!guild)
    guild = await bot.client.guilds.fetch({
      guild: SHRINE_ID,
      withCounts: false,
      cache: true
    });
  let member = guild.members.cache.get(memberId);
  if (!member)
    member = await guild.members.fetch({
      user: memberId,
      cache: true
    });
  return member;
}

async function setCGNickname() {
  try {
    const member = await getMember(CG_MACKIE_ID);
    const nickname = random(first) + random(last);
    await member.setNickname(nickname);
    console.log(`${nickname} set`);
  } catch (error) {
    console.error(error);
  }
}
async function setLimitlessNickname() {
  try {
    const member = await getMember(LIMITLESS_PC_ID);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const time = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    const nickname = `In${time}Net`;
    await member.setNickname(nickname);
    console.log(`${nickname} set`);
  } catch (error) {
    console.error(error);
  }
}
bot.onReady(async () => {
  setInterval(setCGNickname, 1000 * 60 * 60);
  callNextMin(() => setInterval(setLimitlessNickname, 1000 * 60));
  await setCGNickname();
  await setLimitlessNickname();
});

function callNextMin(callback: () => void) {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextMinuteTime = new Date(now.setMinutes(minutes + 1));
  const timeToNextMinute = nextMinuteTime.getTime() - now.getTime();
  setTimeout(callback, timeToNextMinute);
}
