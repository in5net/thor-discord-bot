import db, { and, eq } from "$lib/database/drizzle";
import { playlists } from "$lib/database/schema";
import command from "$lib/discord/commands/text";
import { fromJSON } from "$src/music/songs";
import { getVoice } from "$src/music/voice-manager";
import { ChannelType, GuildMember } from "discord.js";

export default command(
  {
    desc: "Loads your playlist into the queue",
    args: {
      name: {
        type: "text",
        desc: "The name of the playlist",
      },
    },
    permissions: ["vc"],
  },
  async ({ message, args: { name } }) => {
    const { guildId, member, author } = message;
    if (!guildId || !(member instanceof GuildMember)) {
      return;
    }
    const voice = getVoice(guildId);

    const playlist = await db.query.playlists.findFirst({
      columns: {
        songs: true,
      },
      where: and(eq(playlists.userId, author.id), eq(playlists.name, name)),
    });
    if (!playlist) {
      return message.reply("Playlist not found");
    }

    const songs = playlist.songs.flatMap(song =>
      song.type === "playlist" || song.type === "group" ?
        song.songs.map(fromJSON)
      : fromJSON(song),
    );
    for (const song of songs) {
      song.requester = {
        uid: author.id,
        name: member.displayName,
      };
    }

    voice.queue.push(...songs);
    await message.reply(`Loaded ${songs.length} songs`);
    if (member.voice.channel?.type === ChannelType.GuildVoice) {
      voice.stream.channel = member.voice.channel;
    }
    return voice.play();
  },
);
