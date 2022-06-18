import command from './command.ts';

type Response = {
  breeds: string[];
  id: string;
  url: string;
  width: number;
  height: number;
}[];

export default command(
  {
    desc: 'Sends a random cat',
    options: {}
  },
  async i => {
    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const data: Response = await response.json();
    const [cat] = data;
    if (!cat) throw new Error('No cat found');
    return i.reply(cat.url);
  }
);
