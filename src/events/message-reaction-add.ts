import { YouTubeSong } from "$src/music/songs";
import { getVoice } from "$src/music/voice-manager";
import db, { and, eq } from "$lib/database/drizzle";
import { youtubeSearches } from "$lib/database/drizzle/schema";
import event from "$lib/discord/event";
import { env } from "node:process";

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

export default event(
  { name: "messageReactionAdd" },
  async ({ args: [{ message, emoji }, user] }) => {
    if (user.bot) return;

    const { guild, channelId } = message;
    if (guild) {
      const numberIndex = numberEmojis.indexOf(emoji.name || "");
      if (numberIndex !== -1) {
        const search = await db.query.youtubeSearches.findFirst({
          columns: {
            ids: true,
          },
          where: and(
            eq(youtubeSearches.guildId, guild.id),
            eq(youtubeSearches.channelId, channelId),
            eq(youtubeSearches.messageId, message.id),
          ),
        });
        if (search) {
          const id = search.ids.split(",")[numberIndex];
          const member = await guild.members.fetch(user.id);
          if (id && member.voice.channel) {
            const voice = getVoice(guild.id);
            if (message.partial) message = await message.fetch();
            voice.setChannels(message);
            const song = await YouTubeSong.fromId(id, {
              uid: user.id,
              name: member.displayName,
            });
            voice.queue.push(song);
            await voice.play();
          }
        }
      }
    }

    if (user.id === env.OWNER_ID) await message.react(emoji);
  },
);
