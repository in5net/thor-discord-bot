import musicCommand from "./command";

export default musicCommand(
	{
		desc: "See what order things are going to be loaded in before -play is used",
		args: {
			query: {
				name: "query",
				type: "text",
				desc: "The URLs or YouTube searches to play",
				optional: true,
			},
		},
		permissions: ["vc"],
		examples: ["https://youtu.be/dQw4w9WgXcQ terraria ost"],
	},
	async ({ message, args: { query }, voice }) => {
		const plan = await voice.generatePlanFromQuery(message, query);
		return plan
			.map(({ query, name }, i) => `${i + 1}. ${name}: ${query}`)
			.join("\n");
	},
);
