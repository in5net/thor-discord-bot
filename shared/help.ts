import { MessageEmbed } from 'discord.js';
import type { ColorResolvable } from 'discord.js';

import type Command from './command';

export default function helpCommand(
  title: string,
  prefix: string,
  color: ColorResolvable,
  manual: Command[]
): Command {
  return {
    name: 'help',
    desc: 'Shows help for a/all command(s)',
    usage: '<command?>',
    aliases: ['h'],
    async exec({ channel }, args) {
      if (!args.length)
        return channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle(`${title} Commands`)
              .setDescription(
                manual
                  .map(({ name, aliases }) =>
                    [name, ...(aliases?.map(alias => alias) || [])].join('|')
                  )
                  .join(', ')
              )
              .setColor(color)
          ]
        });

      let commandManual: Command | undefined;
      let commandManuals = manual;
      const usage: string[] = [];
      const commands = args.map(arg => arg.toLowerCase());
      for (const command of commands) {
        commandManual = commandManuals.find(
          ({ name, aliases }) => name === command || aliases?.includes(command)
        );
        if (!commandManual) {
          commandManual = undefined;
          break;
        }
        commandManuals = commandManual.subcommands || [];
        usage.push(
          commandManual.usage
            ? `${commandManual.name} ${commandManual.usage}`
            : [commandManual.name, ...(commandManual.aliases || [])].join('/')
        );
      }
      if (!commandManual)
        return channel.send(
          `No help found for command \`${commands.join(' ')}\``
        );

      const embed = new MessageEmbed()
        .setTitle(`${title} Help: ${commands.join(' ')}`)
        .setDescription(commandManual.desc)
        .setColor(color)
        .addField('Usage', `\`${prefix}${usage.join(' ')}\``);
      if (commandManual.subcommands)
        embed.addField(
          'Subcommands',
          commandManual.subcommands.map(({ name }) => `\`${name}\``).join(', ')
        );
      return channel.send({ embeds: [embed] });
    }
  };
}
