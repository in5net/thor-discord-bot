import { sleep } from "@iz7n/std/async";
import { random, randomInt } from "@iz7n/std/random";
import command from "$lib/discord/commands/text";

export default command(
  {
    desc: "Launches a DDOS attack",
    args: {},
  },
  async ({ message: { channel } }) => {
    await channel.sendTyping();
    await sleep(random(5000));
    await channel.send("Launching DDOS attack...");
    await sleep(random(5000));
    await channel.send("Preparing fleet...");
    await sleep(random(5000));
    await channel.send(`Fleet size chosen: ${randomInt(100, 1000)}`);
    await sleep(random(5000));
    await channel.send("Launching attack...");
    await sleep(random(5000));
    await channel.send("Attack launched! Please wait...");
    await sleep(random(30_000));
    await channel.send(
      `Attack finished, ${randomInt(100)}% packet loss, ${randomInt(
        100,
      )}% packet delay, ${randomInt(100)}% packet corruption, ping: ${randomInt(
        1000,
      )}ms, casualties: ${randomInt(100, 1000)}, end of log.`,
    );
  },
);
