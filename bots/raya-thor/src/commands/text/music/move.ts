import musicCommand from "./command";
import woof from "$services/woof";

export default musicCommand(
	{
		aliases: ["mv"],
		desc: "Moves song #i to position #j in the queue. You may use `last` to refer to the last song in the queue",
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
	},
	async ({ message, args: { from, to }, voice }) => {
		const queue = await voice.getQueue();
		const { length } = queue;

		const i = from === "last" ? length - 1 : Number.parseInt(from) - 2;
		const index = to === "last" ? length - 1 : Number.parseInt(to) - 2;

		if (
			Number.isNaN(i) ||
			Number.isNaN(index) ||
			i < 0 ||
			index < 0 ||
			i >= length ||
			index >= length
		)
			return message.reply(`${woof()}, please provide valid numbers`);

		return voice.move(i, index);
	},
);
