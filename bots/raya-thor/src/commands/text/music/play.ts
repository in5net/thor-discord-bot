import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["p"],
		desc: "Plays a song by name or URL",
		args: {
			query: {
				name: "query",
				type: "text",
				desc: "The URLs or YouTube searches to play",
				optional: true,
			},
		},
		permissions: ["vc"],
	},
	async ({ message, args: { query }, voice }) => voice.add(message, query)
);
