import woof from "$lib/woof";
import { type SongType } from "$src/music/song";
import { quantify } from "@in5net/std/string";
import logger from "logger";
import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["rm"],
		desc: "Removes songs from the queue. You may use `last` to refer to the last song in the queue and `n-m` to specify a range.",
		args: {
			ns: {
				type: "words",
				desc: "The song number to remove",
			},
		},
		permissions: ["vc"],
		examples: ["1 3", "last 1", "1-3"],
	},
	async ({ message, args: { ns }, voice }) => {
		const { queue } = voice;

		const indices: number[] = [];
		for (const str of ns) {
			if (str === "last") indices.push(queue.length - 1);
			else if (str.includes("-")) {
				const [startStr = "1", endStr = "1"] = str.split("-");
				const start = Number.parseInt(startStr);
				const end = Number.parseInt(endStr);
				for (let n = start; n <= end; n++) {
					indices.push(n - 1);
				}
			} else {
				const n = Number.parseInt(str);
				indices.push(n - 1);
			}
		}

		logger.debug("indices:", indices);

		for (const i of indices) {
			if (Number.isNaN(i) || i < 0 || i >= queue.length)
				return message.reply(`${woof()}, please provide a valid numbers`);
		}

		const songs: Array<[index: number, song: SongType]> = [];
		for (const i of indices) {
			const song = queue.remove(i);
			if (song) songs.push([i, song]);
		}

		return voice.send(
			`✂️ Removed ${quantify("song", songs.length)}:
${songs.map(([i, song]) => `${i + 1}. **${song.title}**`).join("\n")}`,
		);
	},
);
