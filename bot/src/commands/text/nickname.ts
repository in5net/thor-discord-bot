import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
import command from "discord/commands/text";

export default command(
	{
		aliases: ["nick"],
		desc: "Change the bot's nickname",
		args: {
			nickname: {
				type: "text",
				desc: "The new nickname",
				optional: true,
			},
		},
	},
	async ({ message, args: { nickname }, client }) => {
		const { author } = message;
		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, author.id),
		});
		if (!user?.admin) {
			await message.reply("Only admins can change the bot's nickname");
			return;
		}

		const guild = client.guilds.cache.get(message.guildId || "");
		await guild?.members.me?.setNickname(nickname || null);
		await message.reply(`Nickname changed to ${nickname || "default"}`);
	},
);
