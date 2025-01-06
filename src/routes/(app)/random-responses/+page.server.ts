import db from "$lib/database/drizzle";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  await parent();

  const results = await db.query.randomResponses.findMany({
    columns: {
      id: true,
      words: true,
      responses: true,
      chance: true,
      cooldown: true,
    },
  });
  return {
    randomResponses: results,
  };
};
