import command from '$commands/slash';
import prisma from '$services/prisma';
import { FILES_DOMAIN } from 'storage';

import { NSFW_FILE_NAME } from './shared';

export default command(
  {
    desc: 'Get a random gif from yyyyyyy.info',
    options: {}
  },
  async i => {
    const [gif] = await prisma.$queryRaw<{ name: string }[]>`SELECT name
      FROM Y7File
      WHERE name != ${NSFW_FILE_NAME} AND extension = 'gif'
      ORDER BY RAND()
      LIMIT 1`;
    if (!gif) return i.reply('No image found');

    const url = `https://${FILES_DOMAIN}/y7/images/${gif.name}`;
    return i.reply(url);
  }
);
