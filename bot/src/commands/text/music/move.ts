import woof from "$lib/woof";
import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["mv"],
		desc: "Moves song #from to position #to in the queue. You may use `last` to refer to the last song in the queue",
		args: {
			from: {
				type: "word",
				desc: "The song number to move",
			},
			to: {
				type: "word",
				desc: "The position to move the song to",
			},
		},
		permissions: ["vc"],
		examples: ["1 3", "last 1"],
	},
	async ({ message, args: { from, to }, voice }) => {
		const { length } = voice.queue;

		const i = from === "last" ? length - 1 : Number.parseInt(from) - 1;
		const index = to === "last" ? length - 1 : Number.parseInt(to) - 1;

		if (Number.isNaN(i))
			return message.reply(`${woof()}, \`#from\` is not an integer`);
		if (Number.isNaN(index))
			return message.reply(`${woof()}, \`#to\` is not an integer`);
		if (i < 0) return message.reply(`${woof()}, \`#from\` is too small`);
		if (index < 0) return message.reply(`${woof()}, \`#to\` is too small`);
		if (i >= length) return message.reply(`${woof()}, \`#from\` is too big`);
		if (index >= length) return message.reply(`${woof()}, \`#to\` is too big`);

		return voice.move(i, index);
	},
);
