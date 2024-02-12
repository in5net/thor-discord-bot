import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["pn"],
		desc: "Adds a song url or YouTube search, and files if given, to the front of the queue and starts playing it",
		args: {
			queries: {
				type: "text",
				desc: "The URLs or YouTube searches to play",
				optional: true,
			},
		},
		permissions: ["vc"],
		examples: ["https://youtu.be/dQw4w9WgXcQ terraria ost"],
	},
	async ({ message, args: { queries }, voice }) => {
		voice.setChannels(message);

		const songs = await voice.getSongsFromQuery(message, queries);
		voice.queue.unshift(...songs);

		if (songs.length)
			await voice.channel?.send(
				`⏏️ Added ${songs
					.map(song => song.title)
					.slice(0, 10)
					.join(", ")}${
					songs.length > 10 ? ", ..." : ""
				} to the front of the queue`,
			);

		return voice.play(true);
	},
);
