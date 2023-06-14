import { parse } from "node:path";
import { env } from "node:process";
import { random, shuffle } from "@in5net/limitless";
import {
	ChannelType,
	type Client,
	userMention,
	type Message,
} from "discord.js";
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
import { type TextCommand } from "discord/commands/text";
import { runCommand } from "discord/events/message-create";
import randomResponses, {
	randomResponsesRef as randomResponsesReference,
} from "../responses";
import { handleWordleMessage } from "../commands/text/wordle";
import prisma from "$services/prisma";
import { incCount } from "$services/users";
import woof from "$services/woof";

const prefix = env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
	caseInsensitive,
]);
const whitespaceRegex = createRegExp(whitespace, [global]);

export default event(
	{ name: "messageCreate" },
	async ({ client, args: [message] }) => {
		const { content, channel, channelId, author, attachments } = message;
		if (author.bot) return;
		if (!("send" in channel)) return;
		const lowercase = content.toLowerCase();
		const noWhitespace = lowercase.replaceAll(whitespaceRegex, "");
		if (
			["among", "imposter", "imposta", "amogus", "mongus"].some(string_ =>
				noWhitespace.includes(string_)
			) &&
			author.id !== client.user?.id
		) {
			await message.delete();
			let message_ = "salad mundus detected";
			if (Math.random() < 0.3)
				message_ += ` gave 1 strike to ${userMention(message.author.id)}`;
			await channel.send(message_);
			await incCount(author.id, "salad_mundus");
		} else if (
			prefixRegex.test(content) ||
			client.textCommands.some(
				({ optionalPrefix }, name) =>
					optionalPrefix && lowercase.startsWith(name)
			)
		)
			await handleTextCommand(client, message);
		else await handleRandomResponse(message);

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

async function handleTextCommand(client: Client, message: Message) {
	const { content, channel } = message;
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
		if (command) {
			await (command.permissions?.includes("vc") &&
			!message.member?.voice.channel
				? message.reply(`${woof()}, you are not in a voice channel`)
				: runCommand(name, command, trueArguments, message));
		} else {
			const suggestion = closest(name, [...client.textCommands.keys()]);
			await channel.send(
				`${
					Math.random() < 0.1 ? "No" : `IDK what \`${name}\` is`
				}. Did you mean ${suggestion}?`
			);
		}
	}
}

async function handleRandomResponse(message: Message) {
	const { content, author, channel, member } = message;
	if (content.length === 5) await handleWordleMessage(message);

	const lowercase = content.toLowerCase().replace(/<@!?\d+>/g, "");
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
				await randomResponsesReference.doc(id).update({
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
