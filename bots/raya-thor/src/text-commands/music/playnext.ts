import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["pnx"],
		desc: "Adds a song url or YouTube search, and files if given, to the front of the queue",
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
		await voice.add(message, queries);
		return voice.move(queue.length - 1, 0);
	}
);
