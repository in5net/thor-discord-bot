import command from '$commands/slash';
import prisma from '$services/prisma';
import { FILES_DOMAIN } from 'storage';

export default command(
  {
    desc: 'Get a random gif from yyyyyyy.info',
    options: {}
  },
  async i => {
    const [gif] = await prisma.$queryRaw<{ name: string }[]>`SELECT name
      FROM RotatingFood
      ORDER BY RAND()
      LIMIT 1`;
    if (!gif) return i.reply('No food found');

    const url = `https://${FILES_DOMAIN}/rotatingfood5/${encodeURIComponent(
      gif.name
    )}`;
    return i.reply(url);
  }
);
