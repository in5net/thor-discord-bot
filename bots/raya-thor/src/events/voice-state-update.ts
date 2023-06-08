import { env } from "node:process";
import event from "discord/event";
import voices from "../music/voice-manager";

const timeouts = new Map<string, NodeJS.Timeout>();
const FIVE_MINUTES = 1000 * 60 * 5;

export default event(
	{ name: "voiceStateUpdate" },
	async ({ args: [oldState] }) => {
		const members = oldState.channel?.members;
		if (!members?.has(env.DISCORD_ID)) return;

		const guildId = oldState.guild.id;
		if (members.size === 1) {
			const timeout = timeouts.get(guildId);
			if (timeout) timeout.refresh();
			else {
				timeouts.set(
					guildId,
					setTimeout(async () => {
						const voice = voices.get(guildId);
						await voice?.stop();
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
