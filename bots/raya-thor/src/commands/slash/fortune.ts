import command from "discord/commands/slash";
import got from "got";

interface Data {
	fortune: string;
}

export default command(
	{
		desc: "Get a random fortune cookie",
		options: {},
	},
	async i => {
		const data = await got("http://yerkee.com/api/fortune").json<Data>();
		return i.reply(data.fortune);
	}
);
