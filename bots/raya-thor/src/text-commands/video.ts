import command from '$commands/text';
import { getRandomFile, sendFile } from '../commands/file/shared';

export default command(
  {
    aliases: ['v'],
    desc: 'Get a random video',
    args: {}
  },
  async ({ message }) => {
    const file = await getRandomFile('video');
    if (!file) return message.reply('No file found');
    return sendFile(message, file);
  }
);
