import prisma from './prisma';

export async function getUser(uid: string) {
  const user = await prisma.user.findUnique({
    where: {
      uid
    }
  });
  return user;
}

export const incCount = async (uid: string, name: string) => {
  const user = await prisma.user.findUnique({
    where: {
      uid
    },
    select: {
      counts: true
    },
    rejectOnNotFound: false
  });
  const counts = (user?.counts || {}) as Record<string, number>;
  const newCounts = {
    ...counts,
    [name]: (counts[name] || 0) + 1
  };
  return prisma.user.upsert({
    create: {
      uid
    },
    update: {
      counts: newCounts
    },
    where: {
      uid
    }
  });
};
