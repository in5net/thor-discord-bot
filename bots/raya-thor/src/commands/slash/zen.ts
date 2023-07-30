import command from "discord/commands/slash";
import got from "got";

const url = "https://api.github.com/zen";

export default command(
	{
		desc: `Gets a random zen quote from ${url}`,
		options: {},
	},
	async i => {
		await i.deferReply();
		const text = await got(url).text();
		return i.editReply(text);
	},
);
