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
	},
	async ({ message, args: { queries }, voice }) => {
		const queue = await voice.getQueue();
		voice.setChannels(message);

		const things = await voice.getSongs(message, queries);
		const songs = things.flatMap(song => ("songs" in song ? song.songs : song));
		queue.unshift(...songs);

		if (songs.length)
			await voice.channel?.send(
				`⏏️ Added ${songs
					.map(song => song.title)
					.slice(0, 10)
					.join(", ")}${
					songs.length > 10 ? ", ..." : ""
				} to the front of the queue`
			);

		return voice.play(true);
	}
);
