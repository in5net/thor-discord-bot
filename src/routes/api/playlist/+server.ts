import db, { and, eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import type { RequestHandler } from "./$types";
import { createId } from "@paralleldrive/cuid2";
import { error, json } from "@sveltejs/kit";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string(),
  songs: z.array(z.record(z.any())),
});

export const POST: RequestHandler = async ({ request, locals: { user } }) => {
  if (!user) {
    error(400, "You are not logged in");
  }

  const body = await request.json();
  const { name, songs } = bodySchema.parse(body);

  const id = createId();
  await db.transaction(async tx => {
    const existingPlaylist = await tx.query.playlists.findFirst({
      columns: {
        name: true,
      },
      where: and(eq(playlists.userId, user.id), eq(playlists.name, name)),
    });
    if (existingPlaylist) {
      error(404, "A playlist with that name already exists");
    }

    await tx.insert(playlists).values({
      id,
      userId: user.id,
      name,
      songs,
    });
  });

  return json({ id });
};
