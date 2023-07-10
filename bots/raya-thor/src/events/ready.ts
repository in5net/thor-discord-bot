import process, { env } from "node:process";
import { WebhookClient } from "discord.js";
import event from "discord/event";

const { WEBHOOK_URL, NAME, NODE_ENV } = env;

export default event({ name: "ready", once: true }, async () => {
	process.send?.("ready");
	console.timeEnd(NAME);
	console.log(`✅ ${NAME} is ready!`);
	if (NODE_ENV === "production") {
		const webhook = new WebhookClient({ url: WEBHOOK_URL });
		await webhook.send(`✅ ${NAME} is online`);
	}
});
