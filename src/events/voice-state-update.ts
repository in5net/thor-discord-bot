import event from "$lib/discord/event";
import voices from "$src/music/voice-manager";
import ms from "ms";
import { env } from "node:process";

const timeouts = new Map<string, NodeJS.Timeout>();
const FIVE_MINUTES = ms("5m");

export default event(
  { name: "voiceStateUpdate" },
  async ({ args: [oldState] }) => {
    const members = oldState.channel?.members;
    if (!members?.has(env.DISCORD_ID)) {
      return;
    }

    const guildId = oldState.guild.id;
    if (members.size === 1) {
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
