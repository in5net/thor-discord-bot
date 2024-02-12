import event from "discord/event";
import process, { env } from "node:process";

const { NAME } = env;

export default event({ name: "ready", once: true }, async () => {
	process.send?.("ready");
	console.timeEnd(NAME);
	console.log(`✅ ${NAME} is ready!`);
});
