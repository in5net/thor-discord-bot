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
      songs: true,
    },
    where: and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)),
  });
  if (!playlist) {
    error(404, "Playlist not found");
  }

  return {
    playlistId,
    ...playlist,
  };
};
