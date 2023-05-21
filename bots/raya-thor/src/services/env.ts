import prisma from './prisma';

export const COLOR = process.env.COLOR as `#${string}`;

const admins = await prisma.user.findMany({
  select: {
    id: true
  },
  where: {
    admin: true
  }
});
export const ADMIN_IDS = admins.map(({ id }) => id);
