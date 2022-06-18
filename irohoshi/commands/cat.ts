import command from './command.ts';

interface Response {
  file: string;
}

export default command(
  {
    desc: 'Sends a random cat',
    options: {}
  },
  async i => {
    const response = await fetch('https://aws.random.cat/meow');
    const data: Response = await response.json();
    const { file } = data;
    return i.reply(file);
  }
);
