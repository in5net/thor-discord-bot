import event from "discord/event";
import { handleTextCommand } from "discord/events/message-create";
import { caseInsensitive, createRegExp, exactly } from "magic-regexp";
import { env } from "node:process";

const prefix = env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
	caseInsensitive,
]);

export default event(
	{ name: "messageCreate" },
	async ({ client, args: [message] }) => {
		const { content, channel, author } = message;
		if (author.bot) return;
		if (!("send" in channel)) return;
		const lowercase = content.toLowerCase();

		const optionalPrefixCommands = [
			...client.textCommands.filter(command => command.optionalPrefix).keys(),
		];
		if (
			prefixRegex.test(content) ||
			optionalPrefixCommands.some(name => lowercase.startsWith(name))
		)
			await handleTextCommand(message);
	},
);
