import type { HopOn } from '@prisma/client';

import command from '$commands/slash';
import prisma from '$services/prisma';

export default command(
  {
    desc: 'Hop on <insert thing here>',
    options: {}
  },
  async i => {
    await i.deferReply();
    await i.deleteReply();
    const [{ id }]: [HopOn] = await prisma.$queryRaw`SELECT id
      FROM HopOn
      ORDER BY RAND()
      LIMIT 1`;
    await i.channel?.send(`https://tenor.com/view/${id}`);
  }
);
