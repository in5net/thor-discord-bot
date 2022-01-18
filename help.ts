import { MessageEmbed } from 'discord.js';
import type { ColorResolvable } from 'discord.js';

import type Command from './command';

interface CommandManual {
  name: string;
  usage?: string;
  value: string;
  subcommands?: CommandManual[];
}

export default function helpCommand(
  title: string,
  prefix: string,
  color: ColorResolvable,
  manual: CommandManual[]
): Command {
  return async ({ channel }, args) => {
    if (!args.length)
      return channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`${title} Help`)
            .setDescription('Commands')
            .setColor(color)
            .addFields(
              manual.map(({ name, usage, value, subcommands }) => ({
                name: `${name}: \`${prefix}${usage}${
                  subcommands
                    ? ` <${subcommands.map(({ name }) => name).join('|')}>`
                    : ''
                }\``,
                value
              }))
            )
        ]
      });

    let commandManual: CommandManual | undefined;
    let commandManuals = manual;
    const usage: string[] = [];
    const commands = args.map(arg => arg.toLowerCase());
    for (const command of commands) {
      commandManual = commandManuals.find(({ name }) => name === command);
      if (!commandManual) {
        commandManual = undefined;
        break;
      }
      commandManuals = commandManual.subcommands || [];
      usage.push(commandManual.usage || commandManual.name);
    }
    if (!commandManual)
      return channel.send(
        `No help found for command \`${commands.join(' ')}\``
      );

    const embed = new MessageEmbed()
      .setTitle(`${title} Help: ${commands.join(' ')}`)
      .setDescription(commandManual.value)
      .setColor(color)
      .addField('Usage', `\`${prefix}${usage.join(' ')}\``);
    if (commandManual.subcommands)
      embed.addField(
        'Subcommands',
        commandManual.subcommands.map(({ name }) => `\`${name}\``).join(', ')
      );
    return channel.send({ embeds: [embed] });
  };
}
