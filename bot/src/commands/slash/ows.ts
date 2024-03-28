import db from "database/drizzle";
import { oneWordStory } from "database/drizzle/schema";
import command from "discord/commands/slash";

export default command(
	{
		desc: "Write a story one word at a time!",
		options: {},
	},
	async i => {
		if (!i.guildId) return;
		await db.insert(oneWordStory).values({
			guildId: BigInt(i.guildId),
		});
		await i.reply(
			'One word story started! Send a word to continue the story. Each person can only send one word at a time, and not twice in a row. The story will end when "the end." is written.',
		);
	},
);
