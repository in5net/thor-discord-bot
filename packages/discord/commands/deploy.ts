import { ApplicationCommandOptionType, Routes } from "discord-api-types/v10";
import { REST } from "discord.js";
import {
	type CommandGroups,
	type CommandOptionType,
	type Commands,
	type SlashCommand,
} from "./slash";

let buildCount = 0;

export async function deploy(
	commands: Commands | CommandGroups,
	token: string,
	applicationId: string
) {
	const rest = new REST().setToken(token);

	buildCount = 0;
	const data = Object.entries(commands).map(([name, command]) =>
		typeof command.desc === "string"
			? build(name, command as SlashCommand)
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

	await rest.put(Routes.applicationCommands(applicationId), {
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

function build(name: string, { desc, options }: SlashCommand) {
	buildCount++;
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
					choices?: Array<{
						name: string;
						value: number | string;
					}>;
					autocomplete: boolean;
				} = {
					name,
					type: commandOptionTypeMap[type],
					description: desc,
					min_value: min,
					max_value: max,
					required: !optional && d === undefined,
					choices:
						type === "choice"
							? // eslint-disable-next-line unicorn/no-instanceof-array
							  choices instanceof Array
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
					autocomplete: !!autocomplete,
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
