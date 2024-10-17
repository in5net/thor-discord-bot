import { MusescoreJSON, MusescoreSong } from "./musescore";
import { Requester } from "./shared";
import { SpotifyJSON, SpotifySong } from "./spotify";
import { URLJSON, URLSong } from "./url";
import { YouTubeJSON, YouTubeSong } from "./youtube";

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
