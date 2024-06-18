import { type SongType } from "$src/music/song";
import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["prev"],
		desc: "Plays the song previously in the queue",
		args: {},
		permissions: ["vc"],
	},
	async ({ voice }) => {
		const { queue, stream } = voice;
		let song: SongType | undefined;
		if (!queue.hasPrev() || !(song = queue.prev()))
			return voice.send("There's no previous song");

		const resource = await song.getResource(stream);
		await voice.stream.play(resource);
		await voice.send(`⏪ Previous: ${song.title}`);
	},
);
