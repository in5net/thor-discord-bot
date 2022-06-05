import { random } from '@limitlesspc/limitless';
import type { Message } from 'discord.js';

import wordle from './wordle-words.json';
import { command } from '$shared/command';

let word = '';
let channelId = '';

export default command(
  {
    name: 'wordle',
    desc: 'Play Wordle!',
    args: [] as const
  },
  async ({ channel }) => {
    word = random(wordle);
    channelId = channel.id;
    console.log('Wordle word:', word);
    return channel.send('Picked word, time to guess!');
  }
);

export function handleMessage({ channel, content }: Message) {
  if (!word || channel.id !== channelId) return;

  const guess = content.toLowerCase();
  if (guess === word) {
    word = '';
    channelId = '';
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
