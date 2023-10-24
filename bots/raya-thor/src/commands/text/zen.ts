import command from "discord/commands/text";
import got from "got";

const url = "https://api.github.com/zen";

export default command(
	{
		desc: `Gets a random zen quote from ${url}`,
		args: {},
	},
	async () => {
		const text = await got(url).text();
		return text;
	},
);
