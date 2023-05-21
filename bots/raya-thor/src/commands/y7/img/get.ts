import command from '$commands/slash';
import prisma from '$services/prisma';
import { FILES_DOMAIN } from 'storage';

export default command(
  {
    desc: 'Get a random image from yyyyyyy.info',
    options: {}
  },
  async i => {
    const [image] = await prisma.$queryRaw<{ name: string }[]>`SELECT name
      FROM Y7File
      WHERE extension != 'gif'
      ORDER BY RAND()
      LIMIT 1`;
    if (!image) return i.reply('No image found');

    const url = `https://${FILES_DOMAIN}/y7/images/${image.name}`;
    return i.reply(url);
  }
);
