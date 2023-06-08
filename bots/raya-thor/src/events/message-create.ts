import { parse } from "node:path";
import { env } from "node:process";
import { random, shuffle } from "@in5net/limitless";
import { ChannelType, EmbedBuilder, userMention } from "discord.js";
import { closest } from "fastest-levenshtein";
import { Timestamp } from "firebase-admin/firestore";
import {
	caseInsensitive,
	createRegExp,
	exactly,
	global,
	whitespace,
} from "magic-regexp";
import event from "discord/event";
import { type ArgumentValue, type TextCommand } from "discord/commands/text";
import randomResponses, {
	randomResponsesRef as randomResponsesReference,
} from "../responses";
import help from "../text-commands/help";
import textCommands from "../text-commands";
import { handleWordleMessage } from "../text-commands/wordle";
import prisma from "$services/prisma";
import { incCount } from "$services/users";
import woof from "$services/woof";

const optionalPrefixCommands = Object.entries(textCommands)
	.filter(([, command]) => command.optionalPrefix)
	.map(([name]) => name);
console.log("Optional prefix commands:", optionalPrefixCommands);

const prefix = env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
	caseInsensitive,
]);
const whitespaceRegex = createRegExp(whitespace, [global]);

export default event(
	{ name: "messageCreate" },
	async ({ client, args: [message] }) => {
		const { content, channel, channelId, author, member, attachments } =
			message;
		if (author.bot) return;
		if (!("send" in channel)) return;
		let lowercase = content.toLowerCase();
		const noWhitespace = lowercase.replaceAll(whitespaceRegex, "");
		if (
			["among", "imposter", "imposta", "amogus", "mongus"].some(string_ =>
				noWhitespace.includes(string_)
			) &&
			author.id !== client.user?.id
		) {
			await message.delete().catch();
			let message_ = "salad mundus detected";
			if (Math.random() < 0.3)
				message_ += ` gave 1 strike to ${userMention(message.author.id)}`;
			await channel.send(message_).catch();
			await incCount(author.id, "salad_mundus");
		} else if (
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
				if (arguments_.length === 0) continue;

				const trueArguments = [...arguments_];
				let command: TextCommand | undefined;
				let commands = { ...textCommands, help } as unknown as Record<
					string,
					TextCommand
				>;
				const commandNames: string[] = [];
				for (const argument of arguments_) {
					commandNames.push(argument);
					const lowerArgument = argument.toLowerCase();
					const subcommand = Object.entries(commands).find(
						([name, { aliases }]) =>
							name === lowerArgument || aliases?.includes(lowerArgument)
					)?.[1];
					if (!subcommand) break;
					trueArguments.shift();
					command = subcommand;
					commands = subcommand.subcommands || {};
				}

				const commandName = commandNames.join(" ");
				try {
					if (!command) {
						if (suggest) {
							const suggestion = closest(commandName, Object.keys(commands));
							await channel.send(
								`${
									Math.random() < 0.1 ? "No" : `IDK what \`${commandName}\` is`
								}. Did you mean ${suggestion}?`
							);
						}
					} else if (
						command.permissions?.includes("vc") &&
						!message.member?.voice.channel
					)
						await message.reply(`${woof()}, you are not in a voice channel`);
					else {
						const parsedArguments: Record<string, ArgumentValue | undefined> =
							{};
						for (const [name, argument] of Object.entries(command.args)) {
							let value: ArgumentValue | undefined;
							switch (argument.type) {
								case "int": {
									{
										const argumentString = trueArguments.shift();
										if (argumentString) {
											const number_ = Number.parseInt(argumentString);
											if (isNaN(number_))
												throw new Error(
													`Argument \`${name}\` must be an integer, got \`${argumentString}\``
												);
											value = number_;
										}
									}

									break;
								}

								case "float": {
									{
										const argumentString = trueArguments.shift();
										if (argumentString) {
											const number_ = Number.parseFloat(argumentString);
											if (isNaN(number_))
												throw new Error(
													`Argument \`${name}\` must be an float, got \`${argumentString}\``
												);
											value = number_;
										}
									}

									break;
								}

								case "word": {
									{
										const argumentString = trueArguments.shift();
										if (argumentString) value = argumentString;
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
		} else {
			if (content.length === 5) await handleWordleMessage(message);

			// Remove @mentions
			lowercase = lowercase.replace(/<@!?\d+>/g, "");
			if (lowercase.includes("ratio")) await incCount(author.id, "ratio");
			if (["noway", "norway"].includes(lowercase.replace(" ", ""))) {
				await channel.send(Math.random() < 0.1 ? "Norway" : "no way");
				await incCount(author.id, "no_way");
			} else {
				const msgs: string[] = [];
				for (const {
					id,
					words,
					responses,
					chance = 1,
					cooldown = 0,
					sentAt,
				} of randomResponses()) {
					const includedWords = words.filter(word => !word.startsWith("-"));
					const excludedWords = words.filter(word => word.startsWith("-"));
					const included = includedWords.length
						? includedWords.some(word => lowercase.includes(word))
						: true;
					const excluded = excludedWords.length
						? excludedWords.some(word => lowercase.includes(word))
						: true;
					const now = Date.now();
					if (
						included &&
						excluded &&
						Math.random() < chance &&
						(!sentAt || now - sentAt.toMillis() > cooldown)
					) {
						msgs.push(random(responses));
						randomResponsesReference.doc(id).update({
							sentAt: Timestamp.now(),
						});
					}
				}

				if (msgs.length) {
					const message_ = shuffle(msgs)
						.join(" ")
						.replaceAll("{name}", member?.displayName || author.username);
					await channel.send(message_);
				}
			}
		}

		if (
			channel.isTextBased() &&
			channel.type !== ChannelType.DM &&
			!channel.isThread() &&
			!channel.nsfw
		)
			await prisma.file.createMany({
				data: attachments.map(({ id, name: fileName, proxyURL }) => {
					const { base, name, ext } = parse(fileName);
					return {
						id: BigInt(id),
						base,
						name,
						ext,
						authorId: BigInt(author.id),
						messageId: BigInt(message.id),
						channelId: BigInt(channelId),
						guildId: BigInt(channel.guildId),
						proxyURL,
					};
				}),
			});
	}
);
