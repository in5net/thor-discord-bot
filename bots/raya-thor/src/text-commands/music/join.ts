import musicCommand from "./command";

export default musicCommand(
	{
		desc: 'Joins the voice channel for ~10 min being all like "ight, ill hang for a bit"',
		args: {},
		permissions: ["vc"],
	},
	async ({ message, voice }) => {
		const queue = await voice.getQueue();
		voice.setChannels(message);
		voice.stream.join();
		if (queue.length) await voice.play();
	}
);
