import { env } from "node:process";
import { EmbedBuilder, type Message, type TextBasedChannel } from "discord.js";
import { caseInsensitive, createRegExp, exactly } from "magic-regexp";
import Fuse from "fuse.js";
import prisma from "../prisma";
import { type ArgumentValue, type TextCommand } from "../commands/text";

const prefixRegex = createRegExp(exactly(env.PREFIX).at.lineStart(), [
	caseInsensitive,
]);

export async function handleTextCommand(message: Message) {
	const { client, content, channel } = message;
	const lines = content
		.split("\n")
		.map(line => line.trim())
		.filter(Boolean);
	for (const line of lines) {
		const args = line.replace(prefixRegex, "").split(" ");
		if (args.length === 0) continue;

		const trueArguments = [...args];
		let command: TextCommand | undefined;
		const commandNames: string[] = [];
		for (const argument of args) {
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

		const name = commandNames.join(" ");
		if (command)
			await (command.permissions?.includes("vc") &&
			!message.member?.voice.channel
				? message.reply(`You are not in a voice channel`)
				: runCommand(name, command, trueArguments, message));
		else {
			const list = [...client.textCommands.entries()]
				.map(([name, command]) => ({ name, ...command }))
				.sort((a, b) => a.name.localeCompare(b.name));
			const fuse = new Fuse(list, {
				keys: ["name", "aliases"],
				threshold: 0.2,
			});
			const [suggestion] = fuse.search(name, { limit: 1 });
			if (suggestion)
				await channel.send(
					`${
						Math.random() < 0.1 ? "No" : `IDK what \`${name}\` is`
					}. Did you mean \`${suggestion.item.name}\`${
						suggestion.item.aliases
							? `(${suggestion.item.aliases
									.map(alias => `\`${alias}\``)
									.join(", ")})`
							: ""
					}?`
				);
		}
	}
}

export async function runCommand(
	name: string,
	command: TextCommand,
	trueArguments: string[],
	message: Message
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
		await prisma.commandExecution.create({
			data: {
				name,
				type: "Text",
				userId: BigInt(author.id),
				messageId: BigInt(message.id),
				channelId: BigInt(channelId),
				guildId: message.guildId ? BigInt(message.guildId) : undefined,
			},
		});
	} catch (error) {
		await sendError(message.channel, error);
	}
}

// eslint-disable-next-line complexity
function parseArgs(
	command: TextCommand,
	trueArguments: string[],
	message: Message
) {
	const parsedArguments: Record<string, ArgumentValue | undefined> = {};
	for (const [name, argument] of Object.entries(command.args)) {
		let value: ArgumentValue | undefined;
		switch (argument.type) {
			case "int": {
				const argumentString = trueArguments.shift();
				if (argumentString) {
					const n = Number.parseInt(argumentString);
					if (Number.isNaN(n))
						throw new Error(
							`Argument \`${name}\` must be an integer, got \`${argumentString}\``
						);
					value = n;
				}

				break;
			}

			case "float": {
				const argumentString = trueArguments.shift();
				if (argumentString) {
					const n = Number.parseFloat(argumentString);
					if (Number.isNaN(n))
						throw new Error(
							`Argument \`${name}\` must be an float, got \`${argumentString}\``
						);
					value = n;
				}

				break;
			}

			case "word": {
				const argumentString = trueArguments.shift();
				if (argumentString) value = argumentString;
				break;
			}

			case "words": {
				const argumentStrs = [...trueArguments];
				if (argumentStrs.length) value = argumentStrs.filter(Boolean);
				break;
			}

			case "text": {
				const argumentStrs = [...trueArguments];
				if (argumentStrs.length) value = argumentStrs.join(" ");
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
	console.error(error);
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
		console.error("Failed to send error:", error);
	}
}
