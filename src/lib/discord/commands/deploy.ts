import { type MessageCommand } from "./message";
import { type CommandOptionType, type SlashCommand } from "./slash";
import {
  type ApplicationCommandOptionChoiceData,
  REST,
  type Collection,
} from "discord.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Routes,
  type APIApplicationCommandSubcommandGroupOption,
  type APIApplicationCommandSubcommandOption,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody,
  type RESTPutAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export async function deploy(
  {
    slash,
    message,
  }: {
    slash: Collection<string, SlashCommand>;
    message: Collection<string, MessageCommand>;
  },
  token: string,
  applicationId: string,
) {
  const data: RESTPutAPIApplicationCommandsJSONBody = [];
  for (const [name, command] of slash.sort((_a, _b, aName, bName) =>
    aName.localeCompare(bName),
  )) {
    const [commandName = "", groupName, subName] = name.split(" ");
    if (subName && groupName) {
      let commandData = data.find(({ name }) => name === commandName);
      if (!commandData) {
        commandData = {
          name: commandName,
          description: commandName,
          options: [],
        };
        data.push(commandData);
      }

      let groupData = commandData.options?.find(
        ({ name }) => name === groupName,
      );
      if (!groupData) {
        groupData = {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: groupName,
          description: groupName,
          options: [],
        };
        commandData.options?.push(groupData);
      }

      // @ts-expect-error TypeScript doesn't know enough

      groupData.options?.push({
        type: ApplicationCommandOptionType.Subcommand,
        ...build(subName, command),
      });
    } else if (groupName) {
      let commandData = data.find(({ name }) => name === commandName);
      if (!commandData) {
        commandData = {
          name: commandName,
          description: commandName,
          options: [],
        };
        data.push(commandData);
      }

      commandData.options?.push({
        type: ApplicationCommandOptionType.Subcommand,
        ...build(groupName, command),
      });
    } else {
      data.push(build(commandName, command));
    }
  }

  for (const { name } of message.values()) {
    data.push(buildMessageCommand(name));
  }

  const rest = new REST().setToken(token);
  await rest.put(Routes.applicationCommands(applicationId), {
    body: data,
  });
}

const commandOptionTypeMap: Record<
  keyof CommandOptionType,
  ApplicationCommandOptionType
> = {
  string: ApplicationCommandOptionType.String,
  int: ApplicationCommandOptionType.Integer,
  float: ApplicationCommandOptionType.Number,
  bool: ApplicationCommandOptionType.Boolean,
  choice: ApplicationCommandOptionType.String,
  user: ApplicationCommandOptionType.User,
  channel: ApplicationCommandOptionType.Channel,
  attachment: ApplicationCommandOptionType.Attachment,
};

function build(
  name: string,
  { desc, options }: SlashCommand,
):
  | RESTPostAPIChatInputApplicationCommandsJSONBody
  | APIApplicationCommandSubcommandOption
  | APIApplicationCommandSubcommandGroupOption {
  return {
    name,
    description: desc,
    options: Object.entries(options).map(
      ([
        name,
        { desc, type, min, max, optional, default: d, choices, autocomplete },
      ]) => {
        const data: {
          name: string;
          type: ApplicationCommandOptionType;
          description: string;
          min_value?: number;
          max_value?: number;
          min_length?: number;
          max_length?: number;
          required: boolean;
          choices?: ApplicationCommandOptionChoiceData[];
          autocomplete: boolean;
        } = {
          name,
          type: commandOptionTypeMap[type],
          description: desc,
          min_value: min,
          max_value: max,
          required: !optional && d === undefined,
          autocomplete: !!autocomplete,
        };
        if (type === "int" || type === "float") {
          data.min_value = min;
          data.max_value = max;
        } else if (type === "string") {
          data.min_length = min;
          data.max_length = max;
        } else if (type === "choice" && choices) {
          data.choices =
            Array.isArray(choices) ?
              choices.map(choice => {
                if (typeof choice === "object") {
                  return choice;
                }
                return {
                  name: choice.toString(),
                  value: choice,
                };
              })
            : Object.entries(choices).map(([value, name]) => ({
                name,
                value,
              }));
        }

        return data;
      },
    ),
  };
}

function buildMessageCommand(
  name: string,
): RESTPostAPIContextMenuApplicationCommandsJSONBody {
  return {
    name,
    type: ApplicationCommandType.Message,
  };
}
