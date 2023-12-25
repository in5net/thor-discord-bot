import db from "database/drizzle";
import { commandExecutions } from "database/drizzle/schema";
import { EmbedBuilder, type Message, type TextBasedChannel } from "discord.js";
import Fuse from "fuse.js";
import logger from "logger";
import { caseInsensitive, createRegExp, exactly } from "magic-regexp";
import { env } from "node:process";
import { Lexer, Parser, stringifyNode, type Node } from "../../command";
import { type ArgumentValue, type TextCommand } from "../commands/text";

const prefixRegex = createRegExp(exactly(env.PREFIX).at.lineStart(), [
	caseInsensitive,
]);

export async function handleTextCommand(message: Message) {
	const { client, content, channel } = message;

	const ast = parseContent(content);

	for (const commandNode of ast.value) {
		const { name, args } = commandNode.value;

		const trueArguments = [name, ...args];
		let command: TextCommand | undefined;
		const commandNames: string[] = [];
		for (const arg of [name, ...args]) {
			if (arg.type === "ident") {
				const subcommandName = (arg as Node<"ident">).value.value;
				commandNames.push(subcommandName);
				const lowerArgument = subcommandName.toLowerCase();
				const subcommand = client.textCommands.find(
					({ aliases }, name) =>
						name === lowerArgument || aliases?.includes(lowerArgument),
				);
				if (!subcommand) break;
				trueArguments.shift();
				command = subcommand;
			}
		}

		const fullName = commandNames.join(" ");
		if (command)
			await (command.permissions?.includes("vc") &&
			!message.member?.voice.channel
				? message.reply(`You are not in a voice channel`)
				: runCommand(fullName, command, trueArguments, message));
		else {
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
						suggestion.item.aliases
							? `(${suggestion.item.aliases
									.map(alias => `\`${alias}\``)
									.join(", ")})`
							: ""
					}?`,
				);
		}
	}
}

export function parseContent(content: string) {
	const lexer = new Lexer(content);
	const tokens = lexer.lex();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	return ast;
}

export async function runCommand(
	name: string,
	command: TextCommand,
	trueArguments: Node[],
	message: Message,
) {
	const { client, author, channelId } = message;
	try {
		const parsedArguments = parseArgs(command, trueArguments, message);

		const result = await command.exec({
			message,
			args: parsedArguments as Record<string, ArgumentValue>,
			client,
		});
		if (typeof result === "string") await message.channel.send(result);
		await db.insert(commandExecutions).values({
			name,
			type: "text",
			userId: BigInt(author.id),
			messageId: BigInt(message.id),
			channelId: BigInt(channelId),
			guildId: message.guildId ? BigInt(message.guildId) : undefined,
		});
	} catch (error) {
		await sendError(message.channel, error);
	}
}

// eslint-disable-next-line complexity
function parseArgs(
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
				if (node?.type !== "int") {
					throw new Error(
						`Argument \`${name}\` must be an integer, got \`${stringifyNode(
							node,
						)}\``,
					);
				}

				const typedNode = node as Node<"int">;
				const n = typedNode.value.value;
				const small = n < min;
				const big = n > max;
				if (small || big)
					throw new Error(
						`Argument \`${name}\` must be ${
							small && big
								? `between ${min} and ${max}`
								: small
								  ? `no less than ${min}`
								  : `no more than ${max}`
						}, got \`${n}\``,
					);
				value = n;

				break;
			}

			case "float": {
				const node = trueArguments.shift();
				if (node?.type !== "float") {
					throw new Error(
						`Argument \`${name}\` must be an float, got \`${stringifyNode(
							node,
						)}\``,
					);
				}

				const typedNode = node as Node<"float">;
				const n = typedNode.value.value;
				const small = n < min;
				const big = n > max;
				if (small || big)
					throw new Error(
						`Argument \`${name}\` must be ${
							small && big
								? `between ${min} and ${max}`
								: small
								  ? `no less than ${min}`
								  : `no more than ${max}`
						}, got \`${n}\``,
					);
				value = n;

				break;
			}

			case "word": {
				const node = trueArguments.shift();
				if (node) {
					const value = stringifyNode(node);
					const small = value.length < min;
					const big = value.length > max;
					if (small || big)
						throw new Error(
							`Argument \`${name}\` must be ${
								small && big
									? `between ${min} and ${max}`
									: small
									  ? `no less than ${min}`
									  : `no more than ${max}`
							} characters long`,
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
					if (small || big)
						throw new Error(
							`Argument \`${name}\` must be ${
								small && big
									? `between ${min} and ${max}`
									: small
									  ? `no less than ${min}`
									  : `no more than ${max}`
							} characters long`,
						);
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
			throw new Error(`Argument \`${name}\` is required`);
		parsedArguments[name] = value;
	}

	return parsedArguments;
}

async function sendError(channel: TextBasedChannel, error: unknown) {
	logger.error(error);
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
