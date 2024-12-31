import db, { and, eq } from "$lib/database/drizzle";
import { playlists, songs } from "$lib/database/schema";
import type { RequestHandler } from "./$types";
import { error, text } from "@sveltejs/kit";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string(),
  songs: z.array(
    z.object({
      id: z.string(),
      data: z.object({
        title: z.string(),
        duration: z.number().positive(),
      }),
    }),
  ),
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
    const existingPlaylist = await db.query.playlists.findFirst({
      columns: {
        name: true,
      },
      where: and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)),
    });
    if (!existingPlaylist) {
      error(404, "Playlist not found");
    }

    if (playlist.name !== existingPlaylist.name) {
      await tx
        .update(playlists)
        .set({ name: playlist.name })
        .where(eq(playlists.id, playlistId));
    }

    await tx.delete(songs).where(eq(songs.playlistId, playlistId));
    await tx.insert(songs).values(
      playlist.songs.map(({ id, data }, i) => ({
        id,
        playlistId,
        order: i + 1,
        data,
      })),
    );
  });

  return text("ok");
};
