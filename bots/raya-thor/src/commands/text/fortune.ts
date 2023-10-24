import command from "discord/commands/text";
import got from "got";

interface Data {
	fortune: string;
}

export default command(
	{
		desc: "Get a random fortune cookie",
		args: {},
	},
	async () => {
		const data = await got("http://yerkee.com/api/fortune").json<Data>();
		return data.fortune;
	},
);
