import command from "$lib/discord/commands/slash";
import logger from "$lib/logger";
import { getText } from "$lib/y7";
import items from "./items";
import { part, type Part } from "./labyrinth";
import questions from "./questions";
import { choice } from "@iz7n/std/random";
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import ms from "ms";
import { env } from "node:process";

export default command(
  {
    desc: "Epiquest!",
    options: {},
  },
  async i => {
    const titles = ["Under", "Re", "Over", "De", "Underdere"];
    const title = choice(titles);
    await i.reply(`Welcome to the ${title}titled Epiquest!`);

    const item = choice(items)!;
    const inventory: string[] = [];
    let good = 0;
    let bad = 0;

    const stringReplace = (string_: string): string =>
      string_.replaceAll("{title}", title).replaceAll("{item}", item.name);

    for (const question_ of questions) {
      const question = question_;
      const { text, answers } = question;

      const embed = new EmbedBuilder()
        .setTitle(
          stringReplace(typeof text === "string" ? text : text(inventory)),
        )
        .setDescription(`${i.user.username}'s epiquest`)
        .setColor(env.COLOR);
      if (inventory.length) {
        embed.addFields({ name: "Inventory", value: inventory.join("\n") });
      }

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`select_${i.user.id}`)
          .addOptions(
            ...answers.map(({ text, emoji }) => ({
              emoji,
              label: stringReplace(typeof text === "string" ? text : text()),
              value: emoji,
            })),
          ),
      );

      await i.followUp({ embeds: [embed], components: [row] });
      const int = await i.channel
        ?.awaitMessageComponent({
          componentType: ComponentType.StringSelect,
          filter: int => int.user.id === i.user.id,
          time: ms("1 min"),
        })
        .catch(() => null);
      if (!int) {
        return i.followUp("Epiquest ran out of time ⏱");
      }

      await int.update({});

      const answer =
        answers.find(answer => answer.emoji === int.values[0]) || answers[0];
      if (answer) {
        const { response, effect, end } = answer;
        if (end) {
          return i.followUp("Epiquest is over!");
        }

        switch (effect) {
          case "good": {
            good++;
            break;
          }

          case "bad": {
            bad++;
          }
        }

        if (response) {
          let text: string;
          if (typeof response === "string") {
            text = response;
          } else {
            const result = response(inventory, item);
            if (typeof result === "string") {
              text = result;
            } else {
              ({ text } = result);
              switch (result.effect) {
                case "good": {
                  good++;
                  break;
                }

                case "bad": {
                  bad++;
                }
              }
            }
          }

          let res = stringReplace(text);
          if (res.includes("{random}")) {
            const text = await getText();
            const word = text.split(" ")[0] || "";
            res = res.replaceAll("{random}", word);
          }

          await i.followUp(`**> ${res}**`);
          logger.debug(`Effect: +${good} -${bad}`);
        }
      }
    }

    // Labyrinth
    let currentPart: Part = part;
    let wrong = 0;
    const timesMap = new WeakMap<Part, Record<string, number>>();
    logger.info("labby time!");

    while (true) {
      const { text, choices } = currentPart;

      const embed = new EmbedBuilder()
        .setTitle(stringReplace(text))
        .setDescription(`${i.user.username}'s epiquest`);
      if (inventory.length) {
        embed.addFields({ name: "Inventory", value: inventory.join("\n") });
      }

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`select_${i.user.id}`)
          .addOptions(
            ...choices.map(({ text, emoji }) => ({
              emoji,
              label: stringReplace(text),
              value: emoji,
            })),
          ),
      );

      await i.followUp({ embeds: [embed], components: [row] });
      const int = await i.channel
        ?.awaitMessageComponent({
          componentType: ComponentType.StringSelect,
          filter: int => int.user.id === i.user.id,
          time: ms("1 min"),
        })
        .catch(() => null);
      if (!int) {
        return i.followUp("Epiquest ran out of time ⏱");
      }

      await int.update({});

      const choice =
        choices.find(choice => choice.emoji === int.values[0]) || choices[0];
      if (choice) {
        const { text, emoji, response, effect } = choice;
        logger.debug(`${int.customId} - ${text}`);

        let times = timesMap.get(currentPart);
        if (!times) {
          times = {};
          timesMap.set(currentPart, times);
        }

        const t = times[emoji] || 0;
        times[emoji] = t + 1;

        switch (effect) {
          case "good": {
            good++;
            break;
          }

          case "bad": {
            bad++;
            break;
          }

          case "wrong": {
            wrong++;
            if (wrong >= 3) {
              bad++;
            }
          }
        }

        if (response) {
          let text: string;
          if (typeof response === "string") {
            text = response;
          } else {
            const result = response(t, wrong >= 3);
            if (typeof result === "string") {
              text = result;
            } else {
              ({ text } = result);
              switch (result.effect) {
                case "good": {
                  good++;
                  break;
                }

                case "bad": {
                  bad++;
                  break;
                }

                case "wrong": {
                  wrong++;
                  if (wrong >= 3) {
                    bad++;
                  }
                }
              }
            }
          }

          let res = stringReplace(text);
          if (res.includes("{random}")) {
            const text = await getText();
            const word = text.split(" ")[0] || "";
            res = res.replaceAll("{random}", word);
          }

          await i.followUp(`**> ${res}**`);
          logger.debug(`Effect: +${good} -${bad}`);
        }

        const nextPart = choice.next?.(t);
        if (nextPart) {
          currentPart = nextPart;
        } else {
          break;
        }
      }
    }

    return i.followUp(`Epiquest is over!`);
  },
);
