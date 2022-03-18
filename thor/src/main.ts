import type Command from '../../command';
import help from './commands/help';
import client from './client';
import commands from './commands';
import { handleMessage } from './commands/wordle';
import './env';
import responses from './responses';

const allCommands = [help, ...commands];

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const { content } = message;
  if (
    ['among', 'imposter', 'imposta', 'amogus', 'mongus'].some(str =>
      content.toLowerCase().includes(str)
    )
  ) {
    await message.delete().catch();
    let msg = 'salad mundus detected';
    if (Math.random() < 0.3) msg += ` gave 1 strike to <@${message.author.id}>`;
    await message.channel.send(msg).catch();
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

  const commandNames = args.slice(1);
  if (!commandNames.length) return;
  const trueArgs = [...commandNames];

  let command: Command | undefined;
  let commands = allCommands;
  for (const commandName of commandNames) {
    const subcommand = commands.find(
      ({ name, aliases }) =>
        name === commandName.toLowerCase() ||
        aliases?.includes(commandName.toLowerCase())
    );
    if (!subcommand) break;
    trueArgs.shift();
    command = subcommand;
    commands = subcommand.subcommands || [];
  }

  try {
    if (!command)
      await message.channel.send(
        Math.random() < 0.1 ? 'No.' : `IDK what ${command} is`
      );
    else await command.exec(message, trueArgs);
  } catch (err) {
    await message.channel.send(`Error ): ${err}`);
  }
  client.user?.setActivity();
});

client.login(process.env.TOKEN).then(() => client.user?.setActivity());

process.once('beforeExit', () => client.user?.setActivity());
