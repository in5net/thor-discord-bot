import client from './client';
import {
  ao3,
  chaos,
  cipher,
  cube,
  fractal,
  gif,
  graph,
  help,
  hex,
  hiragana,
  img,
  mast,
  members,
  noise,
  owo,
  pfp,
  ping,
  pixelsort,
  quest,
  random,
  ratio,
  react,
  sort,
  status,
  text,
  zen,
  wordle,
  rng,
  drive,
  hash
} from './commands';
import { handleMessage } from './commands/wordle';
import './env';
import responses from './responses';

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const { content } = message;
  if (content.length === 5) await handleMessage(message);

  const args = message.content.split(' ');

  if (args[0]?.toLowerCase() !== process.env.PREFIX) {
    const msgs: string[] = [];
    let lowercase = content.toLowerCase();
    // Remove @mentions
    lowercase = lowercase.replace(/<@!?\d+>/g, '');
    if (lowercase.replace(' ', '') === 'noway') {
      await message.channel.send('no way');
      return;
    }
    if (
      message.channel.type !== 'DM' &&
      !message.channel.name.includes('thor')
    ) {
      if (message.channel.name.includes('general')) {
        if (Math.random() > 0.5) return;
      } else return;
    }

    for (const [words, msg] of responses.entries()) {
      const included = words.some(word => lowercase.includes(word));
      if (included) msgs.push(msg);
    }

    if (msgs.length) await message.channel.send(msgs.join(' '));
    return;
  }

  const params = args.slice(2);
  const command = args[1]?.toLowerCase();
  if (!command) return;
  try {
    switch (command) {
      case 'help':
        await help.exec(message, params);
        break;
      case 'img':
      case 'pic':
        await img.exec(message, params);
        break;
      case 'gif':
        await gif.exec(message, params);
        break;
      case 'text':
        await text.exec(message, params);
        break;
      case 'fractal':
        await fractal.exec(message, params);
        break;
      case 'random':
        await random.exec(message, params);
        break;
      case 'noise':
        await noise.exec(message, params);
        break;
      case 'react':
        await react.exec(message, params);
        break;
      case 'ping':
        await ping.exec(message, params);
        break;
      case 'status':
        await status.exec(message, params);
        break;
      case 'members':
        await members.exec(message, params);
        break;
      case 'mast':
        await mast.exec(message, params);
        break;
      case 'cube':
        await cube.exec(message, params);
        break;
      case 'owo':
        await owo.exec(message, params);
        break;
      case 'chaos':
        await chaos.exec(message, params);
        break;
      case 'pixelsort':
        await pixelsort.exec(message, params);
        break;
      case 'sort':
        await sort.exec(message, params);
        break;
      case 'graph':
        await graph.exec(message, params);
        break;
      case 'quest':
        await quest.exec(message, params);
        break;
      case 'ao3':
        await ao3.exec(message, params);
        break;
      case 'cipher':
        await cipher.exec(message, params);
        break;
      case 'zen':
        await zen.exec(message, params);
        break;
      case 'hex':
        await hex.exec(message, params);
        break;
      case 'pfp':
        await pfp.exec(message, params);
        break;
      case 'rng':
        await rng.exec(message, params);
        break;
      case 'ratio':
        await ratio.exec(message, params);
        break;
      case 'hiragana':
        await hiragana.exec(message, params);
        break;
      case 'wordle':
        await wordle.exec(message, params);
        break;
      case 'drive':
        await drive.exec(message, params);
        break;
      case 'hash':
        await hash.exec(message, params);
        break;
      default:
        await message.channel.send(
          Math.random() < 0.1 ? 'No.' : `IDK what ${command} is`
        );
    }
    client.user?.setActivity();
  } catch (err) {
    await message.channel.send(`Error ): ${err}`);
  }
});

client.login(process.env.TOKEN).then(() => client.user?.setActivity());

process.once('beforeExit', () => client.user?.setActivity());
