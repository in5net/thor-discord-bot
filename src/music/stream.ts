/* eslint-disable unicorn/require-array-join-separator */
import { formatTime } from "$src/lib/time";
import { YouTubeSong, type SongType } from "./songs";
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  entersState,
  joinVoiceChannel,
  type AudioResource,
  type VoiceConnection,
} from "@discordjs/voice";
import { type VoiceChannel } from "discord.js";
import logger from "$lib/logger";
import { TypedEmitter } from "tiny-typed-emitter";

export default class Stream extends TypedEmitter<{
  idle: () => void;
  stop: () => void;
  error: (error: Error) => void;
}> {
  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
    debug: true,
  })
    .on(AudioPlayerStatus.Idle, () => this.emit("idle"))
    .on("error", error => this.emit("error", error));

  channel?: VoiceChannel;
  connection?: VoiceConnection;
  resource?: AudioResource<SongType>;
  filters: string[] = [];

  async join() {
    const { player, channel, connection } = this;
    if (!channel) return;

    logger.info("joining voice channel");
    logger.info(
      `voice connection status was ${connection?.state.status || "gone"}`,
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
        await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
      }
    }

    logger.info(
      `voice connection status now is ${this.connection?.state.status || "gone"}`,
    );
  }

  async play(resource = this.resource) {
    if (!resource) return;
    this.resource = resource;

    await this.join();
    this.player.play(resource);
  }

  async setFilters(filters?: string[]) {
    const { resource } = this;
    if (!resource) {
      logger.debug("no resource to apply filters to");
      return;
    }

    const { metadata } = resource;
    let { start } = metadata;
    if (metadata instanceof YouTubeSong) start += metadata.time || 0;

    let speed = 1;
    for (const values of this.filters) {
      const atempo = /atempo=(\d+\.?\d+)/.exec(values)?.[1];
      if (atempo) speed *= Number.parseFloat(atempo);
      const asetrate = /asetrate=(\d+\.?\d+)/.exec(values)?.[1];
      if (asetrate) speed *= Number.parseFloat(asetrate);
    }
    logger.debug(`current audio speed: ${speed.toFixed(2)}`);

    this.filters = filters || [];
    logger.debug(`set audio filters to ${this.filters || "NONE"}`);

    const playtime = resource.playbackDuration / 1000;
    logger.debug(
      `current audio start: ${formatTime(start)}, playtime: ${formatTime(playtime)}`,
    );
    const seek = start + playtime * speed;
    logger.debug(`seeking to ${formatTime(seek)}`);
    this.resource = await resource.metadata.getResource({
      seek,
      filters,
    });
    this.resource.metadata.start = seek;
    await this.play();
  }

  stop() {
    const { player, connection } = this;
    if (
      connection &&
      connection.state.status !== VoiceConnectionStatus.Destroyed
    )
      connection.destroy();
    logger.debug(
      `the player ${player.stop() ? "will" : "won't"} come to a stop`,
    );
    this.connection = undefined;
    this.emit("stop");
  }
}
