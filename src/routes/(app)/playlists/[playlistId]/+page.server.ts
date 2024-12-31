import db, { and, eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
  parent,
  params: { playlistId },
}) => {
  const { user } = await parent();
  const playlist = await db.query.playlists.findFirst({
    columns: {
      name: true,
    },
    with: {
      songs: {
        columns: {
          id: true,
          order: true,
          data: true,
        },
      },
    },
    where: and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)),
  });
  if (!playlist) {
    error(404, "Playlist not found");
  }

  return {
    playlistId,
    name: playlist.name,
    songs: playlist.songs
      .sort(x => x.order)
      .map(({ id, data }) => ({ id, data })),
  };
};
