import { env } from "node:process";
import { type Collection, EmbedBuilder } from "discord.js";
import { createRegExp, exactly, word } from "magic-regexp";
import command, { argumentType2Name, type TextCommand } from "./commands/text";

export default command(
	{
		aliases: ["h"],
		desc: "Shows help for a/all command(s)",
		args: {
			command: {
				type: "words",
				desc: "The command to show help for",
				optional: true,
			},
		},
	},
	async ({ message: { client, channel }, args: { command: arguments_ } }) => {
		if (!arguments_)
			return channel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${env.NAME} Commands`)
						.setDescription(
							client.textCommands
								.map(({ aliases }, name) =>
									[name, ...(aliases?.map(alias => alias) || [])].join("|")
								)
								.join(", ")
						)
						.setColor(env.COLOR),
				],
			});

		let commandManual: TextCommand | undefined;
		let commandManuals = client.textCommands;
		const usage: string[] = [];
		const commandNames = arguments_.map(argument => argument.toLowerCase());
		for (const command of commandNames) {
			commandManual = commandManuals.find(
				({ aliases }, name) => name === command || aliases?.includes(command)
			);
			if (!commandManual) {
				commandManual = undefined;
				break;
			}

			commandManuals = getSubcommands(command, commandManuals);
			usage.push([command, ...(commandManual.aliases || [])].join("/"));
		}

		if (commandManual)
			usage.push(
				...Object.entries(commandManual.args).map(
					([name, { type, optional, default: default_ }]) =>
						`<${name}${optional ? "?" : ""}: ${argumentType2Name[type]}${
							default_ === undefined ? "" : ` = ${default_}`
						}>`
				)
			);
		else
			return channel.send(
				`No help found for command \`${arguments_.join(" ")}\``
			);

		const embed = new EmbedBuilder()
			.setTitle(`${env.NAME} Help: ${arguments_.join(" ")}`)
			.setDescription(commandManual.desc)
			.setColor(env.COLOR)
			.addFields({
				name: "Usage",
				value: `\`${env.PREFIX}${usage.join(" ")}\``,
			});

		if (commandManuals.size)
			embed.addFields({
				name: "Subcommands",
				value: Object.keys(commandManuals)
					.map(name => `\`${name}\``)
					.join(", "),
			});
		return channel.send({ embeds: [embed] });
	}
);

function getSubcommands(
	name: string,
	commands: Collection<string, TextCommand>
) {
	return commands.filter((_, key) =>
		createRegExp(exactly(name).at.lineStart(), " ", word.at.lineEnd()).test(key)
	);
}
