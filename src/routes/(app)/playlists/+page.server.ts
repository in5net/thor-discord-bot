import db, { eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();
  const results = await db.query.playlists.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: eq(playlists.userId, user.id),
  });
  return {
    playlists: results,
  };
};
