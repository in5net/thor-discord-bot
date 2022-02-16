import { chunk } from '@limitlesspc/limitless';
import type Command from './command';

const ratios = [
  'L',
  'ratio',
  'get gud',
  'cry abt it',
  'ur mom',
  "didn't ask",
  'get real',
  'minecraft > fortnite',
  'i know ur ip',
  'get got',
  "don't care",
  'stay mad',
  'cope harder',
  'hoes mad',
  'skill issue',
  'basic',
  'audacity',
  'try harder',
  'any askers',
  'triggered',
  'twitter user',
  'discord mod',
  'based',
  'cringe',
  'touch grass',
  'gg ez',
  'ok and?',
  'get a life',
  'professional loser',
  'reported',
  'your problem',
  'straight cash',
  'no friends',
  'done for',
  'rip bozo',
  'league player',
  'no bitches?',
  'ask deez',
  'irrelevant',
  'where?',
  'problematic',
  'go ahead and whine',
  'redpilled',
  'you fell off',
  'ez clap',
  'mad free',
  'counter ratio',
  'final ratio',
  "didn't ask again",
  'counter-counter ratio',
  'spell check',
  'grammar mistake',
  'baby dragon user',
  'too easy',
  'wahh',
  'look at ur face',
  'jealous',
  'cancelled',
  'banned',
  'kicked',
  'lol',
  'lmao',
  'glhf',
  'stay pressed'
];
const numRatios = 20;

const ratio: Command = async ({ channel }) => {
  const indices = new Set<number>();
  while (indices.size < numRatios) {
    indices.add(Math.floor(Math.random() * ratios.length));
  }
  const ratioStrings = [...indices].map(i => ratios[i] || '');
  return channel.send(
    chunk(ratioStrings, 5)
      .map(arr => arr.join(' + '))
      .join('\n+ ')
  );
};

export default ratio;
