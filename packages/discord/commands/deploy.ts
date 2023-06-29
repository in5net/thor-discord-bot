import {
	ApplicationCommandOptionType,
	Routes,
	type RESTPutAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import { type Collection, REST } from "discord.js";
import { type CommandOptionType, type SlashCommand } from "./slash";

export async function deploy(
	commands: Collection<string, SlashCommand>,
	token: string,
	applicationId: string
) {
	const data: RESTPutAPIApplicationCommandsJSONBody = [];
	for (const [name, command] of commands.sort((_a, _b, aName, bName) =>
		aName.localeCompare(bName)
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
				({ name }) => name === groupName
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
		} else data.push(build(commandName, command));
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

function build(name: string, { desc, options }: SlashCommand) {
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
