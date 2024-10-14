import { choice } from "@in5net/std/random";
import { type Message, type Snowflake } from "discord.js";
import command from "$lib/discord/commands/text";
import { readFileSync } from "node:fs";

const words = readFileSync(
  new URL("../../../../assets/wordle.txt", import.meta.url),
  "utf8",
).split("\n");

const channel2Word = new Map<Snowflake, string>();

export default command(
  {
    desc: "Play wordle!",
    args: {},
  },
  async ({ message: { channel } }) => {
    const word = choice(words) || "";
    channel2Word.set(channel.id, word);
    return channel.send("Picked word, time to guess!");
  },
);

export async function handleWordleMessage({ channel, content }: Message) {
  const word = channel2Word.get(channel.id);
  if (!word) return;

  const guess = content.toLowerCase();
  if (guess === word) {
    channel2Word.delete(channel.id);
    return channel.send(`🟩🟩🟩🟩🟩
${guess} is correct!`);
  }

  const colors = guess
    .split("")
    .map((letter, i) => {
      if (letter === word[i]) return "🟩";
      const index = word.lastIndexOf(letter);
      if (index > -1) {
        if (guess[index] === word[index]) return "⬛️";
        return "🟨";
      }

      return "⬛️";
    })
    .join("");
  return channel.send(colors);
}
