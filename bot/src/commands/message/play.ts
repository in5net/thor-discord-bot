import { getVoice } from "$src/music/voice-manager";
import command from "discord/commands/message";
import { createRegExp, letter, oneOrMore } from "magic-regexp";
import { env } from "node:process";

export default command("Play", async i => {
	const message = i.targetMessage;
	const { guildId, content } = message;
	if (!guildId) return;
	const voice = getVoice(guildId);

	const queries = content.replace(
		createRegExp(env.PREFIX, oneOrMore(letter)),
		"",
	);
	await voice.add(message, queries);
	await i.reply("Added to queue");
});
