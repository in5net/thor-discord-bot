import db, { and, eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import type { RequestHandler } from "./$types";
import { error, text } from "@sveltejs/kit";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string(),
  songs: z.array(z.record(z.any())),
});

export const PUT: RequestHandler = async ({
  request,
  params: { playlistId },
  locals: { user },
}) => {
  if (!user) {
    error(400, "You are not logged in");
  }

  const body = await request.json();
  const playlist = bodySchema.parse(body);

  await db.transaction(async tx => {
    const existingPlaylist = await tx.query.playlists.findFirst({
      columns: {
        id: true,
      },
      where: and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)),
    });
    if (!existingPlaylist) {
      error(404, "Playlist not found");
    }

    await tx
      .update(playlists)
      .set(playlist)
      .where(eq(playlists.id, playlistId));
  });

  return text("ok");
};
