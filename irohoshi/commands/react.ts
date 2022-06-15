import command from './command.ts';

export default command(
  {
    desc: 'Reacts to your message with random emojis',
    options: {}
  },
  async i => {
    const text = await Deno.readTextFile(
      new URL('./emojis.json', import.meta.url)
    );
    const emojis: string[] = JSON.parse(text);
    return Promise.all(
      new Array(12).fill(0).map(() => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        return i.message?.addReaction(emoji);
      })
    );
  }
);
