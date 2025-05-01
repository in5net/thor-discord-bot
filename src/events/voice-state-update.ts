import db from "$lib/database/drizzle";
import { members } from "$lib/database/schema";
import event from "$lib/discord/event";
import voices from "$src/music/voice-manager";
import ms from "ms";
import { env } from "node:process";

const timeouts = new Map<string, NodeJS.Timeout>();
const FIVE_MINUTES = ms("5m");

export default event(
  { name: "voiceStateUpdate" },
  async ({ args: [oldState, newState] }) => {
    const guildId = oldState.guild.id;
    if (newState.channelId && newState.member) {
      await db
        .insert(members)
        .values({
          id: newState.member.id,
          guildId,
          lastJoinedVcAt: new Date(),
          lastJoinedVcId: newState.channelId,
        })
        .onConflictDoUpdate({
          set: {
            lastJoinedVcAt: new Date(),
            lastJoinedVcId: newState.channelId,
          },
          target: [members.id, members.guildId],
        });
    }

    const oldMembers = oldState.channel?.members;
    if (!oldMembers?.has(env.DISCORD_ID)) {
      return;
    }

    if (oldMembers.size === 1) {
      const timeout = timeouts.get(guildId);
      if (timeout) {
        timeout.refresh();
      } else {
        timeouts.set(
          guildId,
          setTimeout(() => {
            const voice = voices.get(guildId);
            voice?.stop();
            timeouts.delete(guildId);
          }, FIVE_MINUTES),
        );
      }
    } else {
      const timeout = timeouts.get(guildId);
      if (timeout) {
        clearTimeout(timeout);
        timeouts.delete(guildId);
      }
    }
  },
);
