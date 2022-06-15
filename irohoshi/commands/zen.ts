import command from './command.ts';

const url = 'https://api.github.com/zen';

export default command(
  {
    desc: `Gets a random zen quote from ${url}`,
    options: {}
  },
  async i => {
    const response = await fetch(url);
    const text = await response.text();
    return i.reply(text);
  }
);
