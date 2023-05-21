import { shuffle } from '@in5net/limitless';
import type { Ratio } from '@prisma/client';

import command from '$commands/slash';
import prisma from '$services/prisma';
import { incCount } from '$services/users';

const NUM_RATIOS = 50;

export default command(
  {
    desc: 'Get ratioed',
    options: {}
  },
  async i => {
    await i.deferReply();
    await i.deleteReply();
    const ratios = await prisma.$queryRaw<Ratio[]>`SELECT content
      FROM Ratio
      ORDER BY RAND()
      LIMIT ${NUM_RATIOS}`;
    const texts = shuffle(ratios.map(({ content }) => content));
    await i.channel?.send(
      texts.join(' + ') ||
        'Looks like there are no ratios, use `/ratio add` to add some'
    );
    await incCount(i.user.id, 'ratio');
  }
);
