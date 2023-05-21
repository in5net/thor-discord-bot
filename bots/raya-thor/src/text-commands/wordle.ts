import { random } from '@in5net/limitless';
import type { Message, Snowflake } from 'discord.js';
import { readFileSync } from 'node:fs';

import command from '$commands/text';

const words = readFileSync(
  new URL('../../assets/wordle.txt', import.meta.url),
  'utf8'
).split('\n');

const channel2Word = new Map<Snowflake, string>();

export default command(
  {
    desc: 'Play wordle!',
    args: {}
  },
  ({ message: { channel } }) => {
    const word = random(words);
    channel2Word.set(channel.id, word);
    return channel.send('Picked word, time to guess!');
  }
);

export function handleWordleMessage({ channel, content }: Message) {
  const word = channel2Word.get(channel.id);
  if (!word) return;

  const guess = content.toLowerCase();
  if (guess === word) {
    channel2Word.delete(channel.id);
    return channel.send(`${guess} is correct!`);
  }

  const colors = guess
    .split('')
    .map((letter, i) => {
      if (letter === word[i]) return '🟩';
      const index = word.lastIndexOf(letter);
      if (index > -1) {
        if (guess[index] === word[index]) return '⬛️';
        return '🟨';
      }
      return '⬛️';
    })
    .join('');
  return channel.send(colors);
}
