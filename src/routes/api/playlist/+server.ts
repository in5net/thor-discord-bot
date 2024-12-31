import db, { and, eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import type { RequestHandler } from "./$types";
import { createId } from "@paralleldrive/cuid2";
import { error, json } from "@sveltejs/kit";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string(),
});

export const POST: RequestHandler = async ({ request, locals: { user } }) => {
  if (!user) {
    error(400, "You are not logged in");
  }

  const body = await request.json();
  const { name } = bodySchema.parse(body);

  const id = createId();
  await db.transaction(async tx => {
    const existingPlaylist = await db.query.playlists.findFirst({
      columns: {
        name: true,
      },
      where: and(eq(playlists.userId, user.id), eq(playlists.name, name)),
    });
    if (!existingPlaylist) {
      error(404, "A playlist with that name already exists");
    }

    await tx.insert(playlists).data({ id, name });
  });

  return json({ id });
};
