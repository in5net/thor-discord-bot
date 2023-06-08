import command from "discord/commands/slash";

interface Response {
	fortune: string;
}

export default command(
	{
		desc: "Get a random fortune cookie",
		options: {},
	},
	async i => {
		const response = await fetch("http://yerkee.com/api/fortune");
		const data = (await response.json()) as Response;
		return i.reply(data.fortune);
	}
);
