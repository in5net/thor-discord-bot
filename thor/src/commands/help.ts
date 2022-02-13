import helpCommand from '../../../help';

const help = helpCommand('Thor', 'thor ', 'ORANGE', [
  {
    name: 'help',
    usage: 'help <command?>',
    value: 'Shows this help message or for a specific command'
  },
  {
    name: 'img',
    usage: 'img/pic <search?>',
    value:
      'Sends an image from the best website on the internet, yyyyyyy.info, or from Google Search'
  },
  {
    name: 'gif',
    value: 'Sends a gif from the best website on the internet: yyyyyyy.info'
  },
  {
    name: 'text',
    value: 'Sends text from the best website on the internet: yyyyyyy.info'
  },
  {
    name: 'fractal',
    value: 'Generates a random fractal image'
  },
  {
    name: 'random',
    value: 'Generates a random (literally) image'
  },
  {
    name: 'noise',
    value: 'Generates a image with perlin noise'
  },
  {
    name: 'react',
    value: 'Reacts to your message with random emojis'
  },
  {
    name: 'ping',
    value: 'Pings the bot'
  },
  {
    name: 'status',
    value: 'Shows a bunch of technical information about the bot'
  },
  {
    name: 'members',
    value: 'Shows the number of members in the server'
  },
  {
    name: 'mast',
    value: 'Tells you if the U.S. flag is at half or full mast today'
  },
  {
    name: 'cube',
    value: 'Makes your profile or attachment spin on a cube'
  },
  {
    name: 'owo',
    usage: 'owo <message>',
    value: 'Owoifies a message'
  },
  {
    name: 'chaos',
    usage: 'chaos <num pts=3> <stride=0.5>',
    value: 'Creates chaos'
  },
  {
    name: 'pixelsort',
    value: 'Sorts the pixels in an image'
  },
  {
    name: 'sort',
    usage: 'sort <algorithm=quick> <size=50>',
    value: 'Sorts a random array of numbers'
  },
  {
    name: 'graph',
    usage: 'graph <equation>',
    value: 'Makes a 2D xy graph'
  },
  {
    name: 'quest',
    value: 'Epiquest!'
  },
  {
    name: 'ao3',
    usage: 'ao3 <url>',
    value: 'Gets data of a work on Archive of Our Own'
  },
  {
    name: 'cipher',
    usage: 'cipher encrypt|decrypt <offset> <message>',
    value: 'Encrypts or decrypts a message'
  },
  {
    name: 'zen',
    value: 'Gets a random zen quote from https://api.github.com/zen'
  },
  {
    name: 'hex',
    usage: 'hex <#code>',
    value: 'Gives you a 16x16 image of a hex code'
  },
  {
    name: 'pfp',
    usage: 'pfp <@user?>',
    value: "Gets a user's profile picture"
  },
  {
    name: 'rng',
    usage: 'rng <min> <max> | rng <max> | rng',
    value:
      'Generates a random number between min and max, 1 to a max, or from 1 to 10'
  }
]);
export default help;
