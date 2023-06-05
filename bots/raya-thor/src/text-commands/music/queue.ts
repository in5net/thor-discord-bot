import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["q"],
		desc: "Shows what's in the queue or details about song #n",
		args: {
			n: {
				name: "n",
				type: "int",
				desc: "The song number to show details about",
				optional: true,
			},
		},
	},
	async ({ message, args: { n }, voice }) => {
		const { channel } = message;
		if (typeof n === "number") {
			const embed = await voice.songQueueEmbed(n);
			if ("send" in channel) {
				if (embed) return channel.send({ embeds: [embed] });
				return channel.send(`Song #${n} not found in queue`);
			}
		}

		voice.setChannels(message);
		const {
			stream: { resource },
		} = voice;

		let scale = 1;
		for (const values of voice.stream.filters) {
			const atempo = /atempo=(\d+\.?\d+)/.exec(values)?.[1];
			if (atempo) scale *= Number.parseFloat(atempo);
			const asetrate = /asetrate=(\d+\.?\d+)/.exec(values)?.[1];
			if (asetrate) scale *= Number.parseFloat(asetrate);
		}

		const seconds =
			(resource?.metadata.start || 0) +
			((resource?.playbackDuration || 0) * scale) / 1000;
		if (voice.channel) {
			const queue = await voice.getQueue();
			return queue.embed(voice.channel, seconds);
		}
	}
);
