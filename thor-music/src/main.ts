import client from './client';
import players from './players';
import help from './commands/help';
import commands from './commands';
import './env';
import type Command from '../../command';

const allCommands = [help, ...commands];

client
  .on('messageCreate', async message => {
    if (!message.content.startsWith('-')) return;
    const args = message.content.slice(1).split(' ');

    const commandNames = args.slice(1);
    if (!commandNames.length) return;
    const trueArgs = commandNames.slice(1);

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
      else await command.exec(message, args.slice(2));
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
