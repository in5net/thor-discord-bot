import db from "database/drizzle";
import { commandExecutions } from "database/drizzle/schema";
import { EmbedBuilder, type Message, type TextBasedChannel } from "discord.js";
import Fuse from "fuse.js";
import logger from "logger";
import { env } from "node:process";
import {
	CommandError,
	Lexer,
	Parser,
	getNodeRange,
	stringifyNode,
	type Node,
} from "../../command";
import { type ArgumentValue, type TextCommand } from "../commands/text";
import { getCommandUsage } from "../help";

export async function handleTextCommand(message: Message) {
	const { client, content, channel } = message;

	try {
		const ast = parseContent(content);

		for (const pipedCommands of ast.value) {
			let output: string | undefined;
			for (const commandNode of pipedCommands.value) {
				const { name, args } = commandNode.value;

				const trueArguments: Node[] = [name];
				if (output !== undefined)
					trueArguments.push({
						type: "str",
						value: { type: "str", value: output, range: [0, 0] },
					});
				trueArguments.push(...args);
				let command: TextCommand | undefined;
				const commandNames: string[] = [];
				let commandName = "";
				for (const arg of [name, ...args]) {
					if (arg.type === "ident") {
						const subcommandName = (arg as Node<"ident">).value.value;
						commandNames.push(subcommandName);
						const lowerArgument = subcommandName.toLowerCase();
						const subcommand = client.textCommands.find(
							// eslint-disable-next-line ts/no-loop-func
							({ aliases }, name) =>
								name.startsWith(commandName) &&
								(name === lowerArgument || aliases?.includes(lowerArgument)),
						);
						if (!subcommand) break;
						commandName = `${commandName} ${subcommandName}`.trimStart();
						trueArguments.shift();
						command = subcommand;
					}
				}

				const fullName = commandNames.join(" ");
				if (command) {
					if (
						command.permissions?.includes("vc") &&
						!message.member?.voice.channel
					) {
						await message.reply(`You are not in a voice channel`);
					} else {
						const result = await runCommand(
							fullName,
							command,
							trueArguments,
							message,
						);
						output = typeof result === "string" ? result : undefined;
					}
				} else {
					const list = [...client.textCommands.entries()]
						.map(([name, command]) => ({ name, ...command }))
						.sort((a, b) => a.name.localeCompare(b.name));
					const fuse = new Fuse(list, {
						keys: ["name", "aliases"],
						threshold: 0.2,
					});
					const [suggestion] = fuse.search(fullName, { limit: 1 });
					if (suggestion)
						await channel.send(
							`${
								Math.random() < 0.1 ? "No" : `IDK what \`${fullName}\` is`
							}. Did you mean \`${suggestion.item.name}\`${
								suggestion.item.aliases ?
									`(${suggestion.item.aliases
										.map(alias => `\`${alias}\``)
										.join(", ")})`
								:	""
							}?`,
						);
				}
			}
			if (typeof output === "string") await message.channel.send(output);
		}
	} catch (error) {
		await sendError(
			message.channel,
			error instanceof CommandError ?
				new TypeError(`\`\`\`${error.format(content)}\`\`\``, {
					cause: error,
				})
			:	error,
		);
	}
}

/** @throws {CommandError} */
export function parseContent(content: string) {
	try {
		const lexer = new Lexer(content);
		const tokens = lexer.lex();
		const parser = new Parser(tokens);
		const ast = parser.parse();
		return ast;
	} catch (error) {
		console.error(error);
		throw error instanceof CommandError ?
				new TypeError(`\`\`\`${error.format(content)}\`\`\``, {
					cause: error,
				})
			:	error;
	}
}

export async function runCommand(
	name: string,
	command: TextCommand,
	trueArguments: Node[],
	message: Message,
) {
	const { client, author, channelId } = message;
	const parsedArguments = parseArgs(name, command, trueArguments, message);

	const result = await command.exec({
		message,
		args: parsedArguments as Record<string, ArgumentValue>,
		client,
	});
	await db
		.insert(commandExecutions)
		.values({
			name,
			type: "text",
			userId: BigInt(author.id),
			messageId: BigInt(message.id),
			channelId: BigInt(channelId),
			guildId: message.guildId ? BigInt(message.guildId) : undefined,
		})
		.catch(() => null);
	return result;
}

// eslint-disable-next-line complexity
function parseArgs(
	commandName: string,
	command: TextCommand,
	trueArguments: Node[],
	message: Message,
) {
	const parsedArguments: Record<string, ArgumentValue | undefined> = {};
	for (const [name, argument] of Object.entries(command.args)) {
		let value: ArgumentValue | undefined;
		const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } =
			argument;
		switch (argument.type) {
			case "int": {
				const node = trueArguments.shift();
				if (!node) break;

				if (node?.type !== "int") {
					throw new CommandError(
						`Argument \`${name}\` must be an integer`,
						getNodeRange(node),
					);
				}

				const typedNode = node as Node<"int">;
				const n = typedNode.value.value;
				const small = n < min;
				const big = n > max;
				if (small || big)
					throw new CommandError(
						`Argument \`${name}\` must be ${
							small && big ? `between ${min} and ${max}`
							: small ? `no less than ${min}`
							: `no more than ${max}`
						}`,
						getNodeRange(node),
					);
				value = n;

				break;
			}

			case "float": {
				const node = trueArguments.shift();
				if (!node) break;

				if (node?.type !== "int" && node?.type !== "float") {
					throw new CommandError(
						`Argument \`${name}\` must be an number`,
						getNodeRange(node),
					);
				}

				const typedNode = node as Node<"int" | "float">;
				const n = typedNode.value.value;
				const small = n < min;
				const big = n > max;
				if (small || big)
					throw new CommandError(
						`Argument \`${name}\` must be ${
							small && big ? `between ${min} and ${max}`
							: small ? `no less than ${min}`
							: `no more than ${max}`
						}`,
						getNodeRange(node),
					);
				value = n;

				break;
			}

			case "word": {
				const node = trueArguments.shift();
				if (node) {
					value = stringifyNode(node);
					const small = value.length < min;
					const big = value.length > max;
					if (small || big)
						throw new CommandError(
							`Argument \`${name}\` must be ${
								small && big ? `between ${min} and ${max}`
								: small ? `no less than ${min}`
								: `no more than ${max}`
							} characters long`,
							getNodeRange(node),
						);
				}

				break;
			}

			case "words": {
				const argumentStrs = [...trueArguments];
				if (argumentStrs.length)
					value = argumentStrs.map(stringifyNode).filter(Boolean);
				break;
			}

			case "text": {
				const argumentStrs = [...trueArguments];
				if (argumentStrs.length) {
					value = argumentStrs.map(stringifyNode).join(" ");
					const small = value.length < min;
					const big = value.length > max;

					if (small || big) {
						const first = argumentStrs[0];
						throw new CommandError(
							`Argument \`${name}\` must be ${
								small && big ? `between ${min} and ${max}`
								: small ? `no less than ${min}`
								: `no more than ${max}`
							} characters long`,
							first ?
								[
									getNodeRange(first)[0],
									getNodeRange(argumentStrs.at(-1) || first)[1],
								]
							:	[0, 0],
						);
					}
				}

				break;
			}

			case "image": {
				const file = message.attachments.first();
				if (file) {
					if (typeof file.width === "number" && typeof file.height === "number")
						// @ts-expect-error should be fine, but TypeScript is being dumb
						value = file;
					else throw new Error(`Argument \`${name}\` must be an image file`);
				} else if (argument.default === "user") {
					const size = 512;
					const url = message.author.displayAvatarURL({ size });
					value = {
						url,
						proxyURL: url,
						width: size,
						height: size,
					};
				}
			}
		}

		if (value === undefined && argument.default !== undefined)
			value = argument.default;
		if (!argument.optional && value === undefined)
			throw new Error(`Argument \`${name}\` is required

Usage: \`${getCommandUsage(commandName, command)}\`${
				command.examples ?
					`
Examples: \`\`\`${command.examples
						.map(args => `${env.PREFIX}${commandName} ${args}`)
						.join("\n")}\`\`\``
				:	""
			}`);
		parsedArguments[name] = value;
	}

	return parsedArguments;
}

async function sendError(channel: TextBasedChannel, error: unknown) {
	try {
		await channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor("Red")
					.setTitle("Error")
					.setDescription(error instanceof Error ? error.message : `${error}`)
					.setTimestamp(),
			],
		});
	} catch (error) {
		logger.error("Failed to send error:", error);
	}
}
