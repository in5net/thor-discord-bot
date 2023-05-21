import type { Chicken } from '@prisma/client';
import { AttachmentBuilder } from 'discord.js';

import command from '$commands/slash';
import prisma from '$services/prisma';
import { FILES_DOMAIN } from 'storage';

const stickenFileName = 'stick.png';

export default command(
  {
    desc: 'Chicken!',
    options: {
      sticken: {
        desc: 'Sticken!',
        type: 'bool',
        optional: true
      }
    }
  },
  async (i, { sticken }) => {
    await i.deferReply();
    let name: string;
    if (sticken) name = stickenFileName;
    else {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 1);
      const [chicken] = await prisma.$queryRaw<Chicken[]>`SELECT name
        FROM Chicken
        WHERE sentAt < ${date} OR sentAt IS NULL
        ORDER BY RAND()
        LIMIT 1;`;
      if (!chicken) return i.editReply('No chicken found!');
      await prisma.chicken.update({
        data: {
          sentAt: new Date()
        },
        where: {
          name: chicken.name
        }
      });
      name = chicken.name;
    }
    const url = `https://${FILES_DOMAIN}/chicken/${name}`;
    if (name.endsWith('.mp3'))
      return i.editReply({
        content: null,
        files: [new AttachmentBuilder(url)]
      });
    return i.editReply(url);
  }
);
