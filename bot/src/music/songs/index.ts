import { MusescoreJSON, MusescoreSong } from "./musescore";
import { Requester } from "./shared";
import { SoundCloudJSON, SoundCloudSong } from "./soundcloud";
import { SpotifyJSON, SpotifySong } from "./spotify";
import { URLJSON, URLSong } from "./url";
import { YouTubeJSON, YouTubeSong } from "./youtube";

export * from "./musescore";
export * from "./soundcloud";
export * from "./spotify";
export * from "./url";
export * from "./youtube";

export type SongType =
	| YouTubeSong
	| SpotifySong
	| SoundCloudSong
	| MusescoreSong
	| URLSong;
export type SongJSONType =
	| YouTubeJSON
	| SpotifyJSON
	| SoundCloudJSON
	| MusescoreJSON
	| URLJSON;

export function fromJSON(json: SongJSONType, requester: Requester): SongType {
	switch (json.type) {
		case "youtube": {
			return YouTubeSong.fromJSON(json, requester);
		}

		case "spotify": {
			return SpotifySong.fromJSON(json, requester);
		}

		case "soundcloud": {
			return SoundCloudSong.fromJSON(json, requester);
		}

		case "musescore": {
			return MusescoreSong.fromJSON(json, requester);
		}

		case "url": {
			return URLSong.fromJSON(json, requester);
		}
	}
}
