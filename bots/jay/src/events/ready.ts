import process from "node:process";
import { WebhookClient } from "discord.js";
import event from "$services/event";

const { WEBHOOK_URL, NAME } = process.env;

export default event({ name: "ready", once: true }, async () => {
	console.timeEnd(NAME);
	console.log(`✅ ${NAME} is ready!`);
	if (process.env.DEV !== "1") {
		const webhook = new WebhookClient({ url: WEBHOOK_URL });
		await webhook.send(`✅ ${NAME} is online`);
	}
});
