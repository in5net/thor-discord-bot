import db from "$lib/database/drizzle";
import { commandExecutions } from "$lib/database/schema";
import logger from "$lib/logger";
import { type OptionValue } from "../commands/slash";
import event from "../event";
import {
  type ButtonInteraction,
  EmbedBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type MessageContextMenuCommandInteraction,
} from "discord.js";

export default event({ name: "interactionCreate" }, async ({ args: [i] }) => {
  if (i.isChatInputCommand()) {
    await handleSlash(i);
  } else if (i.isAutocomplete()) {
    await handleAutocomplete(i);
  } else if (i.isMessageContextMenuCommand()) {
    await handleMessageMenu(i);
  } else if (i.isButton()) {
    await handleButton(i);
  }
});

async function handleSlash(i: ChatInputCommandInteraction) {
  const command = getCommand(i);
  if (!command) {
    return;
  }
  const { name, options, handler } = command;

  try {
    await handler(
      i,
      Object.fromEntries(
        Object.entries(options).map(([name, { type, default: d }]) => {
          let value: OptionValue | null = null;
          switch (type) {
            case "string": {
              value = i.options.getString(name);
              break;
            }

            case "int": {
              value = i.options.getInteger(name);
              break;
            }

            case "float": {
              value = i.options.getNumber(name);
              break;
            }

            case "bool": {
              value = i.options.getBoolean(name);
              break;
            }

            case "choice": {
              value = i.options.getString(name);
              break;
            }

            case "user": {
              value = i.options.getUser(name);
              break;
            }

            case "channel": {
              value = i.options.getChannel(name);
              break;
            }

            case "attachment": {
              value = i.options.getAttachment(name);
            }
          }

          return [name, (value ?? d)!];
        }),
      ),
    );

    await db.insert(commandExecutions).values({
      name,
      type: "slash",
      userId: i.user.id,
      channelId: i.channelId,
      guildId: i.guildId,
    });
  } catch (error) {
    const msg = `Error while running command '${name}':`;
    logger.error(msg, error);
    console.error(msg, error);
    if (error instanceof Error) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Error")
        .setDescription(error.message)
        .setTimestamp();
      if (i.replied) {
        await i
          .followUp({ embeds: [embed], ephemeral: true })
          .catch(logger.error);
      } else if (i.deferred) {
        await i.editReply({ embeds: [embed] }).catch(logger.error);
      } else {
        await i.reply({ embeds: [embed], ephemeral: true }).catch(logger.error);
      }
    }
  }
}

async function handleAutocomplete(i: AutocompleteInteraction) {
  const command = getCommand(i);
  if (!command) {
    return;
  }

  const option = i.options.getFocused(true);
  const handleAutocomplete = command.options[option.name]?.autocomplete;
  if (!handleAutocomplete) {
    return;
  }

  const rawChoices = await handleAutocomplete(option.value, i);
  const choices =
    Array.isArray(rawChoices) ?
      rawChoices.map(choice => {
        if (typeof choice === "object") {
          return choice;
        }
        return {
          name: choice.toString(),
          value: choice,
        };
      })
    : Object.entries(rawChoices).map(([value, name]) => ({
        name,
        value,
      }));
  return i
    .respond(
      choices.map(({ name, value }) => ({ name: name.slice(0, 100), value })),
    )
    .catch(logger.error);
}

async function handleMessageMenu(i: MessageContextMenuCommandInteraction) {
  const command = i.client.messageCommands.get(i.commandName);
  if (!command) {
    return;
  }

  const { handler } = command;
  const name = i.commandName;
  try {
    await handler(i);
    await db.insert(commandExecutions).values({
      name,
      type: "message",
      userId: BigInt(i.user.id),
      messageId: BigInt(i.targetId),
      channelId: BigInt(i.channelId),
      guildId: i.guildId ? BigInt(i.guildId) : undefined,
    });
  } catch (error) {
    logger.error(`Error while running command '${name}':`, error);
    if (error instanceof Error) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Error")
        .setDescription(error.message)
        .setTimestamp();
      if (i.replied) {
        await i
          .followUp({ embeds: [embed], ephemeral: true })
          .catch(logger.error);
      } else if (i.deferred) {
        await i.editReply({ embeds: [embed] }).catch(logger.error);
      } else {
        await i.reply({ embeds: [embed], ephemeral: true }).catch(logger.error);
      }
    }
  }
}

function getCommand(i: ChatInputCommandInteraction | AutocompleteInteraction) {
  const name = [
    i.commandName,
    i.options.getSubcommandGroup(false),
    i.options.getSubcommand(false),
  ]
    .filter(Boolean)
    .join(" ");
  logger.debug(name);

  const command = i.client.slashCommands.get(name);
  if (!command) {
    return;
  }
  return { ...command, name };
}

async function handleButton(i: ButtonInteraction) {
  const button = i.client.buttonHandlers.get(i.customId);
  if (!button) {
    return;
  }
  const { handler } = button;

  try {
    await handler(i);
  } catch (error) {
    const msg = `Error while running button '${i.customId}':`;
    logger.error(msg, error);
    console.error(msg, error);
    if (error instanceof Error) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Error")
        .setDescription(error.message)
        .setTimestamp();
      if (i.replied) {
        await i
          .followUp({ embeds: [embed], ephemeral: true })
          .catch(logger.error);
      } else if (i.deferred) {
        await i.editReply({ embeds: [embed] }).catch(logger.error);
      } else {
        await i.reply({ embeds: [embed], ephemeral: true }).catch(logger.error);
      }
    }
  }
}
