import command from "$commands/slash";

const url = "https://api.github.com/zen";

export default command(
	{
		desc: `Gets a random zen quote from ${url}`,
		options: {},
	},
	async i => {
		await i.deferReply();
		const response = await fetch(url);
		const text = await response.text();
		return i.editReply(text);
	}
);
