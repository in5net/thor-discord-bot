import { emojiRegex } from "$lib/emoji";
import { incCount } from "$lib/users";
import { choice, randomInt, shuffle } from "@in5net/std/random";
import { sum } from "@in5net/std/stats";
import { userMention, type Message } from "discord.js";
import event from "discord/event";
import { handleTextCommand } from "discord/events/message-create";
import { Timestamp } from "firebase-admin/firestore";
import {
	anyOf,
	caseInsensitive,
	charIn,
	createRegExp,
	digit,
	exactly,
	global,
	letter,
	maybe,
	oneOrMore,
	whitespace,
} from "magic-regexp";
import { env } from "node:process";
import { handleWordleMessage } from "../commands/text/games/wordle";
import randomResponses, {
	randomResponsesRef as randomResponsesReference,
	words,
} from "../responses";

const prefix = env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
	caseInsensitive,
]);
const whitespaceRegex = createRegExp(whitespace, [global]);

const responseVariableRegex = createRegExp(
	"{",
	oneOrMore(anyOf(letter, charIn("._"))).grouped(),
	"}",
	[global],
);

export default event(
	{ name: "messageCreate" },
	async ({ client, args: [message] }) => {
		const { content, channel, author } = message;
		if (author.bot || !("send" in channel)) return;
		const lowercase = content.toLowerCase();
		const noWhitespace = lowercase.replaceAll(whitespaceRegex, "");
		if (
			["among", "imposter", "imposta", "amogus", "mongus"].some(str =>
				noWhitespace.includes(str),
			) &&
			author.id !== client.user?.id
		) {
			await message.delete();
			let msg = "salad mundus detected";
			if (Math.random() < 0.3)
				msg += ` gave 1 strike to ${userMention(message.author.id)}`;
			await channel.send(msg);
			await incCount(author.id, "salad_mundus");
		} else {
			const [first = "", second = "", third = ""] = noWhitespace;
			if (emojiRegex.test(first) && second === "+" && emojiRegex.test(third)) {
				const { default: emojiMix } = await import("emoji-mixer");
				const url = emojiMix(first, third);
				await (url
					? message.reply(url)
					: message.reply("no emoji mix found ):"));
			} else if (
				prefixRegex.test(content) ||
				client.textCommands.some(
					({ optionalPrefix }, name) =>
						optionalPrefix && lowercase.startsWith(name),
				)
			)
				await handleTextCommand(message);
			else if (
				"name" in channel &&
				["general", "thor"].some(name => channel.name.includes(name))
			)
				await handleRandomResponse(message);
		}
	},
);

async function handleRandomResponse(message: Message) {
	const { cleanContent, author, channel, member } = message;
	const lowercase = cleanContent.toLowerCase();

	if (cleanContent.length === 5) await handleWordleMessage(message);
	await handleDiceMessage(message);

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
				msgs.push(choice(responses) || "");
				await randomResponsesReference.doc(id).update({
					sentAt: Timestamp.now(),
				});
			}
		}

		if (msgs.length) {
			const msg = shuffle(msgs)
				.join(" ")
				.replaceAll(responseVariableRegex, match => {
					const variable = match.slice(1, -1);
					if (variable === "name")
						return member?.displayName || author.username;
					const props = variable.split(".");
					const $words = words();
					console.log({ match, variable, props, $words });
					let value: any = $words.themes;
					for (const prop of props) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						value = value[prop];
					}

					return choice(value as string[]) || "";
				});
			await channel.send(msg);
		}
	}
}

const diceRegex = createRegExp(
	digit.times.between(1, 2).groupedAs("count"),
	charIn("dD"),
	digit.times.between(1, 3).groupedAs("sides"),
	maybe(
		exactly(
			charIn("+-").as("operator"),
			digit.times.between(1, 2).groupedAs("modifier"),
		).grouped(),
	),
);

async function handleDiceMessage(message: Message) {
	const { content, channel } = message;
	const matchResult = content.match(diceRegex);
	if (matchResult) {
		const { groups } = matchResult;
		const count = Number.parseInt(groups.count || "1");
		const sides = Number.parseInt(groups.sides || "1");
		const operator = groups.operator || "+";
		const modifier = Number.parseInt(groups.modifier || "0");
		if (count > 0 && sides > 0) {
			const rolls = Array.from({ length: count }, () => {
				let n = randomInt(1, sides);
				if (operator === "+") n += modifier;
				else if (operator === "-") n -= modifier;
				return n;
			});
			let msg = rolls.join(", ");
			if (count > 1) msg = `${sum(rolls)} = ${msg}`;
			await channel.send(msg);
		}
	}
}
