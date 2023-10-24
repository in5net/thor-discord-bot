import command from "discord/commands/text";

export default command(
	{
		desc: "Shankstorm!",
		args: {
			length: {
				type: "int",
				desc: "The number of shanks to send",
				min: 1,
				max: 100,
				default: 100,
			},
		},
	},
	async ({ message: { channel }, args: { length } }) => {
		const text = Array.from<number>({ length })
			.fill(0)
			.map(() => (Math.random() < 0.5 ? "🍗" : "🍖"))
			.join("");
		await channel.send(text);
	},
);
