import { ActivityType } from "discord.js";
import event from "$lib/discord/event";
import process, { env, version } from "node:process";

const { NAME } = env;

export default event({ name: "ready", once: true }, async ({ client }) => {
  process.send?.("ready");
  console.timeEnd(NAME);
  console.log(`✅ ${NAME} is ready!`);
  client.user?.setActivity({
    name: `with Node.js ${version}`,
    type: ActivityType.Playing,
  });
  setTimeout(
    () =>
      client.user?.setActivity({
        name: "with your feelings",
        type: ActivityType.Playing,
      }),
    60_000,
  );
});
