import { getVoice } from "$src/music/voice-manager";
import { type Awaitable } from "discord.js";
import command, {
	type Arguments,
	type Exec,
	type TextCommand,
	type TextCommandParams,
} from "discord/commands/text";

export default function musicCommand<T extends Arguments>(
	params: TextCommandParams<T>,
	exec: (
		params: Parameters<Exec<T>>[0] & { voice: ReturnType<typeof getVoice> },
	) => Awaitable<any>,
): TextCommand<T> {
	return command(params, async ({ message, args, client }) => {
		const { guildId, channel } = message;
		if (!guildId) return;
		const voice = getVoice(guildId);

		if (
			!channel.isDMBased() &&
			channel.name.toLowerCase().includes("general") &&
			Math.random() < 0.2
		)
			await channel.send("Imagine using music commands in general chat");

		return exec({ message, args, client, voice });
	});
}
