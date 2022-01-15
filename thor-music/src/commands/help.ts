import { MessageEmbed } from 'discord.js';

import { color } from '../config';
import type Command from './command';

interface CommandManual {
  name: string;
  usage: string;
  value: string;
  subcommands?: CommandManual[];
}
const manual: CommandManual[] = [
  {
    name: 'help',
    usage: 'help/h <command?>',
    value: 'Shows this help message or for a certain command'
  },
  {
    name: 'play',
    usage: 'play/p <url or YouTube search>',
    value: 'Adds a song url or YouTube search, and files if given, to the queue'
  },
  {
    name: 'queue',
    usage: 'queue/q <n?>',
    value: "Shows what's in the queue or details about song #n"
  },
  {
    name: 'next',
    usage: 'next/skip',
    value: 'Skips the current song and plays the next one'
  },
  { name: 'pause', usage: 'pause', value: 'Pauses/unpauses the player' },
  { name: 'shuffle', usage: 'shuffle', value: 'Shuffles the queue' },
  {
    name: 'playshuffle',
    usage: 'playshuffle/ps <url or YouTube search>',
    value: 'Adds and shuffles the queue'
  },
  { name: 'loop', usage: 'loop', value: 'Loops the queue' },
  {
    name: 'move',
    usage: 'move <i> <j>',
    value: 'Moves song #i to position #j in the queue'
  },
  {
    name: 'remove',
    usage: 'remove/rm <i>',
    value: 'Removes song #i from the queue'
  },
  {
    name: 'stop',
    usage: 'stop/clear/leave',
    value: 'Leaves the voice channel and clears the queue'
  },
  {
    name: 'lyrics',
    usage: 'lyrics/l <song name?>',
    value: 'Gives you the lyrics of the current song or song by name'
  },
  {
    name: 'soundboard',
    usage: 'soundboard/sb',
    value: 'Gives you a bunch of buttons to play random sounds!'
  },
  {
    name: 'playlist',
    usage: 'playlist/pl',
    value: 'Manages your saved playlists',
    subcommands: [
      {
        name: 'get',
        usage: 'get <name>',
        value: 'Shows the songs in your named playlist'
      },
      {
        name: 'list',
        usage: 'list',
        value: 'Shows a list of your saved playlists'
      },
      {
        name: 'save',
        usage: 'save <name> <query?>',
        value:
          'Saves the songs from a query or the queue to your named playlist'
      },
      {
        name: 'add',
        usage: 'add <name> <query?>',
        value: 'Adds the songs from a query or the queue to your named playlist'
      },
      {
        name: 'load',
        usage: 'load <name>',
        value: 'Loads your named playlist into the queue'
      },
      {
        name: 'remove',
        usage: 'remove/rm <name>',
        value: 'Removes your saved named playlist'
      }
    ]
  }
];

const prefix = '-';

const help: Command = async ({ channel }, args) => {
  if (!args.length)
    return channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('Thor Music Help')
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
    usage.push(commandManual.usage);
  }
  if (!commandManual)
    return channel.send(`No help found for command \`${commands.join(' ')}\``);

  const embed = new MessageEmbed()
    .setTitle(`Thor Music Help: ${commands.join(' ')}`)
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
export default help;
