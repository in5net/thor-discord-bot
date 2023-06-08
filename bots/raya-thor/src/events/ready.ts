import { env } from "node:process";
import { WebhookClient } from "discord.js";
import event from "discord/event";

const { WEBHOOK_URL, NAME, DEV } = env;

export default event({ name: "ready", once: true }, async () => {
	console.timeEnd(NAME);
	console.log(`✅ ${NAME} is ready!`);
	if (DEV !== "1") {
		const webhook = new WebhookClient({ url: WEBHOOK_URL });
		await webhook.send(`✅ ${NAME} is online`);
	}
});
