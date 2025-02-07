import db, { and, contains, eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { fromJSON } from "$src/music/songs";
import { getVoice } from "$src/music/voice-manager";
import { shuffle } from "@in5net/std/random";
import { ChannelType, GuildMember } from "discord.js";

export default command(
  {
    desc: "Loads your playlist into the queue",
    options: {
      name: {
        type: "string",
        desc: "The name of the playlist",
        async autocomplete(search, i) {
          const results = await db.query.playlists.findMany({
            columns: {
              name: true,
            },
            where: and(
              eq(playlists.userId, i.user.id),
              contains(playlists.name, search),
            ),
            orderBy: playlists.name,
            limit: 5,
          });
          return results.map(({ name }) => name);
        },
      },
      shuffle: {
        type: "bool",
        desc: "Shuffle the playlist",
        optional: true,
      },
    },
    permissions: ["vc"],
  },
  async (i, { name, shuffle: doShuffle }) => {
    const { guildId, member, user } = i;
    if (!guildId || !(member instanceof GuildMember)) {
      return;
    }
    const voice = getVoice(guildId);

    const playlist = await db.query.playlists.findFirst({
      columns: {
        songs: true,
      },
      where: and(eq(playlists.userId, i.user.id), eq(playlists.name, name)),
    });
    if (!playlist) {
      return i.reply("Playlist not found");
    }

    const songs = playlist.songs.map(song => fromJSON(song));
    for (const song of songs) {
      song.requester = {
        uid: user.id,
        name: member.displayName,
      };
    }

    voice.queue.push(...(doShuffle ? shuffle(songs) : songs));
    await i.reply(`Loaded ${songs.length} songs`);
    if (member.voice.channel?.type === ChannelType.GuildVoice) {
      voice.stream.channel = member.voice.channel;
    }
    return voice.play();
  },
);
