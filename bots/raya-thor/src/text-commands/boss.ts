import command from '$commands/text';
import prisma from '$services/prisma';

export default command(
  {
    desc: 'Get a random video of boss',
    args: {}
  },
  async ({ message }) => {
    const [boss] = await prisma.$queryRaw<{ url: string }[]>`SELECT url
      FROM BossFile
      ORDER BY RAND()
      LIMIT 1`;
    if (!boss) return message.reply('No boss found');
    return message.reply(boss.url);
  }
);
