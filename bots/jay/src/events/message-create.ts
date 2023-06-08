import process from "node:process";
import { EmbedBuilder } from "discord.js";
import { closest } from "fastest-levenshtein";
import { caseInsensitive, createRegExp, exactly } from "magic-regexp";
import { type ArgumentValue, type TextCommand } from "$services/commands/text";
import event from "$services/event";
import prisma from "$services/prisma";

const prefix = process.env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
	caseInsensitive,
]);

export default event(
	{ name: "messageCreate" },
	async ({ client, args: [message] }) => {
		const { content, channel, channelId, author } = message;
		if (author.bot) return;
		if (!("send" in channel)) return;
		const lowercase = content.toLowerCase();

		const optionalPrefixCommands = [
			...client.textCommands.filter(command => command.optionalPrefix).keys(),
		];
		if (
			prefixRegex.test(content) ||
			optionalPrefixCommands.some(name => lowercase.startsWith(name))
		) {
			const lines = content
				.split("\n")
				.map(line => line.trim())
				.filter(Boolean);
			for (const line of lines) {
				const suggest = line.startsWith(prefix);
				const arguments_ = line.replace(prefixRegex, "").split(" ");
				if (!arguments_.length) continue;

				const trueArguments = [...arguments_];
				const commands = client.textCommands;
				let command: TextCommand | undefined;
				const commandNames: string[] = [];
				for (const argument of arguments_) {
					commandNames.push(argument);
					const lowerArgument = argument.toLowerCase();
					const subcommand = client.textCommands.find(
						({ aliases }, name) =>
							name === lowerArgument || aliases?.includes(lowerArgument)
					);
					if (!subcommand) break;
					trueArguments.shift();
					command = subcommand;
				}

				const commandName = commandNames.join(" ");
				try {
					if (command) {
						const parsedArguments: Record<string, ArgumentValue | undefined> =
							{};
						for (const [name, argument] of Object.entries(command.args)) {
							let value: ArgumentValue | undefined;
							switch (argument.type) {
								case "int": {
									{
										const argumentStr = trueArguments.shift();
										if (argumentStr) {
											const number_ = Number.parseInt(argumentStr);
											if (isNaN(number_))
												throw new Error(
													`Argument \`${name}\` must be an integer, got \`${argumentStr}\``
												);
											value = number_;
										}
									}

									break;
								}

								case "float": {
									{
										const argumentStr = trueArguments.shift();
										if (argumentStr) {
											const number_ = Number.parseFloat(argumentStr);
											if (isNaN(number_))
												throw new Error(
													`Argument \`${name}\` must be an float, got \`${argumentStr}\``
												);
											value = number_;
										}
									}

									break;
								}

								case "word": {
									{
										const argumentStr = trueArguments.shift();
										if (argumentStr) value = argumentStr;
									}

									break;
								}

								case "words": {
									{
										const argumentStrs = [...trueArguments];
										if (argumentStrs.length)
											value = argumentStrs.filter(Boolean);
									}

									break;
								}

								case "text": {
									const argumentStrs = [...trueArguments];
									if (argumentStrs.length) value = argumentStrs.join(" ");
								}
							}

							if (value === undefined && argument.default !== undefined)
								value = argument.default;
							if (!argument.optional && value === undefined)
								throw new Error(`Argument \`${name}\` is required`);
							parsedArguments[name] = value;
						}

						await command.exec({
							message,
							args: parsedArguments as Record<string, ArgumentValue>,
							client,
						});
						await prisma.commandExecution.create({
							data: {
								name: commandName,
								type: "Text",
								userId: BigInt(author.id),
								messageId: BigInt(message.id),
								channelId: BigInt(channelId),
								guildId: message.guildId ? BigInt(message.guildId) : undefined,
							},
						});
					} else if (suggest) {
						const suggestion = closest(commandName, Object.keys(commands));
						await channel.send(
							`${
								Math.random() < 0.1 ? "No" : `IDK what \`${commandName}\` is`
							}. Did you mean ${suggestion}?`
						);
					}
				} catch (error) {
					console.error(error);
					try {
						await channel.send({
							embeds: [
								new EmbedBuilder()
									.setColor("Red")
									.setTitle("Error")
									.setDescription(
										error instanceof Error ? error.message : `${error}`
									)
									.setTimestamp(),
							],
						});
					} catch (error) {
						console.error("Failed to send error:", error);
					}
				}
			}
		}
	}
);
