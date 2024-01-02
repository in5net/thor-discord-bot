import { choice } from "@in5net/std/random";
import command from "discord/commands/text";

const answers = [
	"As I see it, yes.",
	"Ask again later.",
	"Better not tell you now.",
	"Cannot predict now.",
	"Concentrate and ask again.",
	"Don't count on it.",
	"It is certain.",
	"It is decidedly so.",
	"Most likely.",
	"My reply is no.",
	"My sources say no.",
	"Outlook not so good.",
	"Outlook good.",
	"Reply hazy, try again.",
	"Signs point to yes.",
	"Very doubtful.",
	"Without a doubt.",
	"Yes.",
	"Yes - definitely.",
	"You may rely on it.",
];

export default command(
	{
		desc: "Ask the magic 8-ball a question, and you will get an answer",
		args: {
			question: {
				type: "text",
				desc: "The question to ask the 8-ball",
				optional: true,
			},
		},
		examples: ["does lean lean taste as good as people say?"],
	},
	async ({ message }) => message.reply(choice(answers) || ""),
);
