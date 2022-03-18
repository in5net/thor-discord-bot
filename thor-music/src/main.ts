import client from './client';
import players from './players';
import help from './commands/help';
import commands from './commands';
import './env';
import type Command from '../../command';

const allCommands = [help, ...commands];

client
  .on('messageCreate', async message => {
    const { content } = message;
    if (!content.startsWith('-')) return;

    const args = content.slice(1).split(' ');
    if (!args.length) return;

    const trueArgs = [...args];
    let command: Command | undefined;
    let commands = allCommands;
    for (const arg of args) {
      const subcommand = commands.find(
        ({ name, aliases }) =>
          name === arg.toLowerCase() || aliases?.includes(arg.toLowerCase())
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
