import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/schema";
import ms from "ms";

export const MAX_BITS = 32;
export const NEW_BITS = 24;

async function getCreditAt(uid: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, uid),
  });

  let creditAt = user?.creditAt;
  if (!creditAt) {
    creditAt = new Date();
    creditAt.setHours(creditAt.getHours() - NEW_BITS);
  }

  const maxCreditAt = new Date();
  maxCreditAt.setHours(maxCreditAt.getHours() - MAX_BITS);
  if (creditAt < maxCreditAt) {
    creditAt = new Date();
    creditAt.setHours(creditAt.getHours() - MAX_BITS);
  }

  return creditAt;
}

const hour = ms("1h");
export async function getBits(uid: string) {
  const creditAt = await getCreditAt(uid);
  const diff = Date.now() - creditAt.getTime();
  const hours = Math.floor(diff / hour);
  return hours;
}

export async function subtractBits(uid: string, price: number) {
  const creditAt = await getCreditAt(uid);
  const diff = Date.now() - creditAt.getTime();
  const hours = Math.floor(diff / hour);
  if (hours < price) {
    return false;
  }

  creditAt.setHours(creditAt.getHours() + price);
  await db
    .insert(users)
    .values({
      id: uid,
      creditAt,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        creditAt,
      },
    });
  return true;
}
