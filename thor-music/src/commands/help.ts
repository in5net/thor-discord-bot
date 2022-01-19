import helpCommand from '../../../help';
import { color } from '../config';

const help = helpCommand('Thor Music', '-', color, [
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
    usage: 'next/n/skip <n?>',
    value:
      'Skips the current song or any number of songs and plays the next one'
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
    usage: 'move/mv <i> <j>',
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
]);
export default help;
