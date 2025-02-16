import event from "$lib/discord/event";
import db from "$src/lib/database/drizzle";
import { fromJSON } from "$src/music/songs";
import { getVoice } from "$src/music/voice-manager";
import { ActivityType, ChannelType } from "discord.js";
import process, { env, version } from "node:process";

const { NAME } = env;

export default event({ name: "ready", once: true }, async ({ client }) => {
  process.send?.("ready");
  console.timeEnd(NAME);
  console.log(`✅ ${NAME} is ready!`);
  client.user?.setActivity({
    name: `with Node.js ${version}`,
    type: ActivityType.Playing,
  });
  setTimeout(
    () =>
      client.user?.setActivity({
        name: "with your feelings",
        type: ActivityType.Playing,
      }),
    60_000,
  );

  const queues = await db.query.queues.findMany();
  for (const { guildId, voiceChannelId, songs, index, seek, loop } of queues) {
    const voice = getVoice(guildId);
    const voiceChannel = await client.channels.fetch(voiceChannelId);
    if (voiceChannel?.type !== ChannelType.GuildVoice) {
      continue;
    }

    voice.setVoiceChannel(voiceChannel);

    const { queue } = voice;
    queue.set(songs.map(fromJSON));
    queue.currentIndex = index - 1;
    queue.loop = loop;

    await voice.play(false, seek);
  }
});
