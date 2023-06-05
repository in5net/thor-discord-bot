import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	Routes,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import { REST } from "discord.js";
import { type MessageCommand } from "./message";
import {
	type Command,
	type CommandGroups,
	type CommandOptionType,
	type Commands,
} from "./slash";

let buildCount = 0;

export async function deploy(
	commands: Commands | CommandGroups,
	messageCommands: MessageCommand[],
	token: string,
	appId: string
) {
	const rest = new REST({ version: "10" }).setToken(token);

	buildCount = 0;
	const data: RESTPostAPIApplicationCommandsJSONBody[] = Object.entries(
		commands
	).map(([name, command]) =>
		typeof command.desc === "string"
			? build(name, command as Command)
			: typeof Object.values(command as Commands | CommandGroups)[0].desc ===
			  "string"
			? {
					name,
					description: name,
					options: Object.entries(command as Commands).map(
						([name, command]) => ({
							type: ApplicationCommandOptionType.Subcommand,
							...build(name, command),
						})
					),
			  }
			: {
					name,
					description: name,
					options: Object.entries(command as CommandGroups).map(
						([name, command]) => ({
							type: ApplicationCommandOptionType.SubcommandGroup,
							name,
							description: name,
							options: Object.entries(command).map(([name, command]) => ({
								type: ApplicationCommandOptionType.Subcommand,
								...build(name, command),
							})),
						})
					),
			  }
	);
	for (const { name } of messageCommands) {
		data.push({ type: ApplicationCommandType.Message, name });
		buildCount++;
	}

	await rest.put(Routes.applicationCommands(appId), {
		body: data,
	});
	return buildCount;
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

function build(name: string, { desc, options }: Command) {
	buildCount++;
	return {
		name,
		description: desc,
		options: Object.entries(options).map(
			([
				name,
				{ desc, type, min, max, optional, default: d, choices, autocomplete },
			]) => {
				const data: any = {
					name,
					type: commandOptionTypeMap[type],
					description: desc,
					min_value: min,
					max_value: max,
					required: !optional && d === undefined,
					choices:
						type === "choice"
							? Array.isArray(choices)
								? choices.map(choice => ({
										name: `${choice}`,
										value: choice,
								  }))
								: Object.entries(choices || {}).map(([name, description]) => ({
										name,
										description,
										value: name,
								  }))
							: undefined,
					autocomplete: Boolean(autocomplete),
				};
				if (type === "int" || type === "float") {
					data.min_value = min;
					data.max_value = max;
				} else if (type === "string") {
					data.min_length = min;
					data.max_length = max;
				}

				return data;
			}
		),
	};
}
