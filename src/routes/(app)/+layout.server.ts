import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/schema";
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
  if (!user) {
    redirect(302, "/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  return {
    user,
    dbUser,
  };
};
