import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/schema";

export async function getUser(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export const incCount = async (id: string, name: string) => {
  const user = await db.query.users.findFirst({
    columns: {
      counts: true,
    },
    where: eq(users.id, id),
  });
  const counts = (user?.counts || {}) as Record<string, number>;
  await db
    .insert(users)
    .values({
      id,
      counts: {
        [name]: 1,
      },
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        counts: {
          ...counts,
          [name]: (counts[name] || 0) + 1,
        },
      },
    });
};
