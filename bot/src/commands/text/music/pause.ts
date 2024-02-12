import { AudioPlayerStatus } from "@discordjs/voice";
import musicCommand from "./command";

export default musicCommand(
	{
		desc: "Pauses/unpauses the current song",
		args: {},
		permissions: ["vc"],
	},
	async ({ voice }) => {
		const paused =
			voice.stream.player.state.status === AudioPlayerStatus.Paused;
		if (paused) voice.stream.player.unpause();
		else voice.stream.player.pause(true);
		return voice.channel?.send(paused ? "⏯️ Resumed" : "⏸️ Paused");
	},
);
