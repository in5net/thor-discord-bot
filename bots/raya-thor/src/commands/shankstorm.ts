import command from "$commands/slash";

export default command(
	{
		desc: "Shankstorm!",
		options: {
			length: {
				type: "int",
				desc: "The number of shanks to send",
				min: 1,
				max: 100,
				default: 100,
			},
		},
	},
	async (i, { length }) => {
		await i.deferReply();
		await i.deleteReply();
		const text = Array.from<number>({ length })
			.fill(0)
			.map(() => (Math.random() < 0.5 ? "🍗" : "🍖"))
			.join("");
		return i.channel?.send(text);
	}
);
