import { type MusescoreJSON, MusescoreSong } from "./musescore";
import type { Requester } from "./shared";
import { type SpotifyJSON, SpotifySong } from "./spotify";
import { type URLJSON, URLSong } from "./url";
import { type YouTubeJSON, YouTubeSong } from "./youtube";

export * from "./musescore";
export * from "./shared";
export * from "./spotify";
export * from "./url";
export * from "./youtube";

export type SongType = YouTubeSong | SpotifySong | MusescoreSong | URLSong;
export type SongJSONType = YouTubeJSON | SpotifyJSON | MusescoreJSON | URLJSON;

export function fromJSON(json: SongJSONType, requester: Requester): SongType {
  switch (json.type) {
    case "youtube": {
      return YouTubeSong.fromJSON(json, requester);
    }

    case "spotify": {
      return SpotifySong.fromJSON(json, requester);
    }

    case "musescore": {
      return MusescoreSong.fromJSON(json, requester);
    }

    case "url": {
      return URLSong.fromJSON(json, requester);
    }
  }
}
