import {
	AudioPlayerStatus,
	VoiceConnectionStatus,
	createAudioPlayer,
	joinVoiceChannel,
	type AudioResource,
	type VoiceConnection,
} from "@discordjs/voice";
import { type VoiceChannel } from "discord.js";
import logger from "logger";
import { TypedEmitter } from "tiny-typed-emitter";
import { YouTubeSong, type SongType } from "./song";

export default class Stream extends TypedEmitter<{
	idle: () => void;
	stop: () => void;
	error: (error: Error) => void;
}> {
	player = createAudioPlayer()
		.on(AudioPlayerStatus.Idle, () => this.emit("idle"))
		.on("error", error => this.emit("error", error));

	channel?: VoiceChannel;
	connection?: VoiceConnection;
	resource?: AudioResource<SongType>;
	filters: string[] = [];

	stop() {
		const { player, connection } = this;
		if (
			connection &&
			connection.state.status !== VoiceConnectionStatus.Destroyed
		)
			connection.destroy();
		player.stop();
		this.connection = undefined;
		this.emit("stop");
	}

	join() {
		const { player, channel, connection } = this;
		if (!channel) return;

		logger.info(
			`From: voice connection status ${connection?.state.status || "gone"}`,
		);

		switch (connection?.state.status) {
			case VoiceConnectionStatus.Ready:
			case VoiceConnectionStatus.Signalling:
			case VoiceConnectionStatus.Connecting: {
				break;
			}

			default: {
				connection?.destroy();
				this.connection = joinVoiceChannel({
					channelId: channel.id,
					guildId: channel.guildId,
					adapterCreator: channel.guild.voiceAdapterCreator,
				});
				this.connection
					.on(VoiceConnectionStatus.Disconnected, () => {
						this.join();
					})
					.subscribe(player);
			}
		}

		logger.info(
			`To: voice connection status ${this.connection?.state.status || "gone"}`,
		);
	}

	play(resource = this.resource) {
		if (!resource) return;
		this.resource = resource;

		this.join();
		this.player.play(resource);
	}

	async setFilters(filters?: string[]) {
		const { resource } = this;
		if (!resource) return;
		let { start } = resource.metadata;
		if (resource.metadata instanceof YouTubeSong)
			start += resource.metadata.time || 0;

		let scale = 1;
		for (const values of this.filters) {
			const atempo = /atempo=(\d+\.?\d+)/.exec(values)?.[1];
			if (atempo) scale *= Number.parseFloat(atempo);
			const asetrate = /asetrate=(\d+\.?\d+)/.exec(values)?.[1];
			if (asetrate) scale *= Number.parseFloat(asetrate);
		}

		this.filters = filters || [];

		const seek =
			(start || 0) + ((this.resource?.playbackDuration || 0) * scale) / 1000;
		logger.debug("start:", start, "scale:", scale, "seek:", seek);
		this.resource = await resource.metadata.getResource({
			seek,
			filters,
		});
		this.resource.metadata.start = seek;
		this.play();
	}
}
