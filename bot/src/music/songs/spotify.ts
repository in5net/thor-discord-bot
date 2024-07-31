import { getPlayDl } from "../play";
import {
	GetResourceListeners,
	GetResourceOptions,
	Requester,
	Song,
	SongJSON,
} from "./shared";
import { getYoutubeFile, streamYoutubeFile } from "./youtube";
import { createAudioResource, StreamType } from "@discordjs/voice";
import chalk from "chalk-template";
import logger from "logger";
import { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from "play-dl";
import Innertube from "youtubei.js";
import { z } from "zod";

const SPOTIFY_SONG =
	/^(https:\/\/)?(open\.spotify\.com\/track\/)([\w-]{22}).*$/;
export interface SpotifyJSON extends SongJSON {
	type: "spotify";
	id: string;
	ytId: string;
	thumbnail?: string;
	artist?: {
		name: string;
		id: string;
	};
	album?: {
		name: string;
		id: string;
	};
}

export class SpotifySong extends Song {
	id: string;
	ytId: string;
	artist?: {
		id: string;
		name: string;
	};

	thumbnail?: string;
	album?: {
		id: string;
		name: string;
	};

	constructor({
		id,
		title,
		ytId,
		duration,
		thumbnail,
		artist,
		album,
		requester,
	}: {
		id: string;
		title: string;
		ytId: string;
		duration: number;
		thumbnail?: string;
		artist?: {
			id: string;
			name: string;
		};
		album?: {
			id: string;
			name: string;
		};
		requester: Requester;
	}) {
		super({ title, duration, requester });
		this.id = id;
		this.ytId = ytId;
		this.thumbnail = thumbnail;
		this.artist = artist;
		this.album = album;
	}

	get iconURL() {
		return "https://cdn-icons-png.flaticon.com/512/2111/2111624.png";
	}

	static id2URL(id: string): string {
		return `https://open.spotify.com/track/${id}`;
	}

	static url2Id(url: string): string {
		return SPOTIFY_SONG.exec(url)?.[3] || "";
	}

	get url(): string {
		return SpotifySong.id2URL(this.id);
	}

	get artistURL(): string {
		return `https://open.spotify.com/artist/${this.artist?.id}`;
	}

	get albumURL(): string {
		const { album } = this;
		return album ? `https://open.spotify.com/album/${album.id}` : "";
	}

	get youtubeURL(): string {
		return `https://www.youtube.com/watch?v=${this.ytId}`;
	}

	log() {
		const { title, artist, album, url, artistURL, albumURL, youtubeURL } = this;
		logger.debug(chalk`🟢 {green [Spotify]}
${title} (${url})
* {red you{white tube}} url: ${youtubeURL}
* artist: ${artist?.name} (${artistURL})${
			album ?
				`
* album: ${album.name} (${albumURL})`
			:	""
		}`);
	}

	toString(): string {
		return `🟢 [Spotify] ${this.title} (${this.url})`;
	}

	toJSON(): SpotifyJSON {
		const { id, ytId, title, duration, thumbnail, artist, album } = this;
		return {
			type: "spotify",
			id,
			ytId,
			title,
			duration,
			thumbnail,
			artist,
			album,
		};
	}

	static fromJSON(
		{ id, ytId, title, duration, thumbnail, artist, album }: SpotifyJSON,
		requester: Requester,
	): SpotifySong {
		return new SpotifySong({
			id,
			ytId,
			title,
			duration,
			thumbnail,
			artist,
			album,
			requester,
		});
	}

	override getEmbed() {
		const { thumbnail, artist, album, url, artistURL, albumURL } = this;
		const embed = super.getEmbed().setColor("Green").setURL(url);
		if (artist)
			embed.setAuthor({
				name: artist.name,
				url: artistURL,
			});
		if (thumbnail) embed.setThumbnail(thumbnail);
		if (album)
			embed.addFields({ name: "Album", value: `[${album.name}](${albumURL})` });
		return embed;
	}

	static async fromURL(
		url: string,
		requester: Requester,
	): Promise<SpotifySong> {
		const play = await getPlayDl();
		if (play.sp_validate(url) !== "track") throw new Error("Invalid URL");

		const {
			name,
			durationInSec: duration,
			thumbnail,
			artists: [artist],
			album,
		} = (await play.spotify(url)) as SpotifyTrack;
		let ytId = "";

		const youtube = await Innertube.create();
		const { videos } = await youtube.search(`${name} ${artist?.name || ""}`, {
			type: "video",
		});
		const { id } = z.object({ id: z.string() }).parse(videos.first());
		ytId = id;

		return new SpotifySong({
			id: SpotifySong.url2Id(url),
			ytId,
			title: name,
			duration,
			thumbnail: thumbnail?.url,
			artist,
			album,
			requester,
		});
	}

	static async fromId(id: string, requester: Requester): Promise<SpotifySong> {
		const url = SpotifySong.id2URL(id);
		return this.fromURL(url, requester);
	}

	static async fromListURL(
		url: string,
		requester: Requester,
	): Promise<SpotifySong[]> {
		const play = await getPlayDl();
		const type = play.sp_validate(url);
		if (type !== "album" && type !== "playlist") return [];

		const spotify = (await play.spotify(url)) as SpotifyAlbum | SpotifyPlaylist;
		const tracks = await spotify.all_tracks();
		return Promise.all(
			tracks.map(async track => SpotifySong.fromId(track.id, requester)),
		);
	}

	override async _prepare(listeners?: GetResourceListeners) {
		await getYoutubeFile(this.ytId, listeners);
	}

	async getResource(options: GetResourceOptions) {
		const stream = await streamYoutubeFile(this.ytId, options);
		const resource = createAudioResource(stream, {
			inputType: StreamType.Opus,
			metadata: this,
		});
		return resource;
	}
}
