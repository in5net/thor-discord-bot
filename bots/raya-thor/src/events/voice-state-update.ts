import event from '$services/event';
import voices from '../music/voice-manager';

const timeouts: Map<string, NodeJS.Timeout> = new Map();
const FIVE_MINUTES = 1000 * 60 * 5;

export default event(
  { name: 'voiceStateUpdate' },
  async ({ args: [oldState] }) => {
    const members = oldState.channel?.members;
    if (!members || !members.has(process.env.DISCORD_ID)) return;

    const guildId = oldState.guild.id;
    if (members.size === 1) {
      const timeout = timeouts.get(guildId);
      if (timeout) timeout.refresh();
      else {
        timeouts.set(
          guildId,
          setTimeout(() => {
            const voice = voices.get(guildId);
            voice?.stop();
            timeouts.delete(guildId);
          }, FIVE_MINUTES)
        );
      }
    } else {
      const timeout = timeouts.get(guildId);
      if (timeout) {
        clearTimeout(timeout);
        timeouts.delete(guildId);
      }
    }
  }
);
