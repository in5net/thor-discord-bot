import { getVoice } from "$src/music/voice-manager";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/text";
import { Buffer } from "node:buffer";

export default command(
	{
		aliases: ["l"],
		desc: "Gives you the lyrics of the current song or song by name",
		args: {
			song_name: {
				type: "text",
				desc: "The name of the song to get the lyrics of",
				optional: true,
			},
		},
		examples: ["", "we are number one"],
	},
	async ({ message, args: { song_name } }) => {
		const { guildId } = message;
		if (!guildId) return;
		const voice = getVoice(guildId);

		voice.setChannels(message);
		const lyrics = await voice.getLyrics(song_name);
		if (lyrics.length <= 2000) return voice.send(lyrics);
		return voice.send({
			files: [
				new AttachmentBuilder(Buffer.from(lyrics), { name: "lyrics.txt" }),
			],
		});
	},
);
