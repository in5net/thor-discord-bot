import command from '$commands/slash';
import { getRandomFile, sendFile } from './shared';

export default command(
  {
    desc: 'Get a random audio file',
    options: {}
  },
  async i => {
    const file = await getRandomFile('audio');
    if (!file) return i.reply('No file found');
    return sendFile(i, file);
  }
);
