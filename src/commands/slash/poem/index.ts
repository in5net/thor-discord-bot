import { parse } from "$lib/rcpt";
import { choice, randomInt } from "@in5net/std/random";
import { capitalize } from "@in5net/std/string";
import command from "$lib/discord/commands/slash";
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomPerson } from "./person";

const themesPath = new URL("../../../../assets/poem/themes", import.meta.url)
  .pathname;
const files = readdirSync(themesPath);
const themes = files.map(file => file.replace(".rcpt", ""));

export default command(
  {
    desc: "Generates a random poem from Recurrent Complex, the Minecraft mod",
    options: {
      theme: {
        desc: "The theme to use",
        type: "choice",
        choices: themes,
        optional: true,
      },
    },
  },
  async (i, { theme = choice(themes) }) => {
    const author = randomPerson(Math.random() < 0.9);

    const poemPath = new URL(
      "../../../../assets/poem/poem.rcpt",
      import.meta.url,
    );
    const poemSource = await readFile(poemPath, "utf8");
    const poemSections = parse(poemSource);

    const themePath = join(themesPath, `${theme}.rcpt`);
    const themeSource = await readFile(themePath, "utf8");
    const themeSections = parse(themeSource);

    const sections = { ...poemSections, ...themeSections };

    const memory = new Map<string, string>();
    const title = capitalize(visit(sections.title || []));
    const text = visit(sections.text || []);

    function visit(section: string[]): string {
      const line = choice(section) || "";
      return line.replaceAll(/<([a-z- \d]+)>/g, (_, key: string) => {
        const remembered = memory.get(key);
        if (remembered) return remembered;

        const [name = "", option] = key.split(" ");
        let text: string;
        switch (name) {
          case "name": {
            text = randomPerson(Math.random() < 0.9).firstName;
            break;
          }

          case "number": {
            {
              const numberStrs = key.split(" ");
              numberStrs.shift();
              const numbers = numberStrs.map(n => Number.parseInt(n));
              const [min = 0, max = 0, mul = 1] = numbers;
              const number = randomInt(min, max) * mul;
              text = number.toString();
            }

            break;
          }

          default: {
            const section = sections[name] || [];
            text = visit(section);
          }
        }

        if (option === "rep") return `${text}\n${text}`;
        if (option === "rem") memory.set(name, text);
        return text;
      });
    }

    await i.reply(`**${title}**
*by ${author.fullName}*

${text.split("\n").map(capitalize).join("\n")}`);
  },
);
