import type { SpeechBubble } from "database";
import { FILES_DOMAIN } from "storage";
import command from "$commands/slash";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Sends a speech bubble",
		options: {},
	},
	async i => {
		await i.deferReply();
		await i.deleteReply();
		const [{ name }] = await prisma.$queryRaw<[SpeechBubble]>`SELECT name
      FROM SpeechBubble
      ORDER BY RAND()
      LIMIT 1;`;
		await i.channel?.send(`https://${FILES_DOMAIN}/speech-bubbles/${name}`);
	}
);
