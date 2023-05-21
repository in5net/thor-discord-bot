import { AudioPlayerStatus } from '@discordjs/voice';
import { shuffle } from '@in5net/limitless';
import {
  ChannelType,
  Message,
  MessageCreateOptions,
  TextChannel
} from 'discord.js';
import {
  anyOf,
  caseInsensitive,
  charIn,
  createRegExp,
  digit,
  exactly,
  letter,
  maybe,
  oneOrMore,
  wordBoundary
} from 'magic-regexp';
import play from 'play-dl';
import { TypedEmitter } from 'tiny-typed-emitter';

import { getLyrics } from '$services/genius';
import * as playlist from './playlist';
import Queue from './queue';
import type { Album, SongType } from './song';
import { SoundCloudSong, SpotifySong, URLSong, YouTubeSong } from './song';
import Stream from './stream';

const YOUTUBE_CHANNEL_REGEX = createRegExp(
  exactly('http')
    .and(maybe('s'))
    .and('://')
    .and(maybe('www.'))
    .and('youtu')
    .and(exactly('be.com').or('.be'))
    .and('/')
    .and(exactly('channel').or('c'))
    .and('/')
    .and(oneOrMore(anyOf(letter.lowercase, digit, charIn('_-'))))
);

const URL_REGEX = createRegExp(
  anyOf(letter.lowercase, digit, charIn('-@:%._+~#='))
    .times.between(1, 256)
    .and('.')
    .and(anyOf(letter.lowercase, digit, charIn('()')).times.between(1, 6))
    .and(wordBoundary)
    .and(
      anyOf(letter.lowercase, digit, charIn('-()@:%_+.~#?&//=')).times.any()
    ),
  [caseInsensitive]
);

export default class Voice extends TypedEmitter<{
  stop: () => void;
}> {
  stream = new Stream()
    .on('idle', async () => {
      try {
        const queue = await this.getQueue();
        if (queue?.size) {
          await this.stream.join();
          await this.play();
        } else await this.stream.stop();
      } catch (error) {
        console.error('⚠️ Player error:', error);
        await this.send('⚠️ Error');
        await this.next();
      }
    })
    .on('error', async error => {
      console.error('⚠️ Player error:', error);
      try {
        await this.send('⚠️ Error');
        await this.next();
      } catch (error) {
        console.error('⚠️ Error:', error);
      }
    });

  channel?: TextChannel;
  private message?: Message;

  queue?: Queue;

  constructor(readonly guildId: string) {
    super();
  }

  async send(message: string | MessageCreateOptions) {
    [this.message] = await Promise.all([
      this.channel?.send(message),
      this.message?.delete().catch(() => {})
    ]);
  }

  setChannels(message: Message): void {
    const { channel, member } = message;
    if (channel.type === ChannelType.GuildText) this.channel = channel;
    const voiceChannel = member?.voice.channel;
    if (voiceChannel?.type === ChannelType.GuildVoice)
      this.stream.channel = voiceChannel;
  }

  async getQueue() {
    if (!this.queue) this.queue = await Queue.create(this);
    return this.queue;
  }

  async getSongs(
    message: Message,
    query?: string
  ): Promise<(SongType | Album<YouTubeSong>)[]> {
    const { stream } = this;
    const queue = await this.getQueue();
    const { author, member, attachments } = message;
    const requester = {
      uid: author.id,
      name: member?.nickname || author.username
    };

    const urlSongsCache = new Map<string, URLSong>();
    for (const { url } of attachments.values()) {
      let song = urlSongsCache.get(url);
      if (!song) {
        song = await URLSong.fromURL(url, requester);
        urlSongsCache.set(url, song);
      }
      queue.push(song);
      song.log();
      if (stream.player.state.status === AudioPlayerStatus.Playing)
        await this.send(`⏏️ Added ${song.title} to queue`);
    }

    const queries: string[] = [];
    if (query) {
      const words = query.split(' ').filter(Boolean);
      let text = '';
      for (const word of words) {
        const isUrl = URL_REGEX.test(word);
        if (isUrl) {
          if (text.trim()) {
            queries.push(text.trim());
            text = '';
          }
          queries.push(word);
        } else text += `${word} `;
      }
      if (text) {
        queries.push(...text.trim().split('\n'));
        text = '';
      }
    }
    console.log('Queries:', queries);

    const songs: (SongType | Album<YouTubeSong>)[] = [];
    const songsCache = new Map<string, (SongType | Album<YouTubeSong>)[]>();
    if (play.is_expired()) await play.refreshToken();
    for (const query of queries) {
      const mds = songsCache.get(query);
      if (mds) {
        songs.push(...mds);
        continue;
      }
      if (play.yt_validate(query) === 'playlist') {
        const id = play.extractID(query);
        try {
          const album = await YouTubeSong.fromPlaylistId(id, requester);
          songs.push(album);
          songsCache.set(query, [album]);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid YouTube playlist url');
        }
      } else if (play.yt_validate(query) === 'video') {
        try {
          const song = await YouTubeSong.fromURL(query, requester);
          songs.push(song);
          songsCache.set(query, [song]);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid YouTube video url');
        }
      } else if (YOUTUBE_CHANNEL_REGEX.test(query)) {
        try {
          const id = YOUTUBE_CHANNEL_REGEX.exec(query)?.[2] || '';
          const videos = await YouTubeSong.fromChannelId(id, requester);
          songs.push(...videos);
          songsCache.set(query, videos);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid YouTube channel url');
        }
      } else if (play.sp_validate(query) === 'track') {
        try {
          const song = await SpotifySong.fromURL(query, requester);
          songs.push(song);
          songsCache.set(query, [song]);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid Spotify song url');
        }
      } else if (
        ['album', 'playlist'].includes(play.sp_validate(query) as string)
      ) {
        try {
          const songs = await SpotifySong.fromListURL(query, requester);
          songs.push(...songs);
          songsCache.set(query, songs);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid Spotify album/playlist url');
        }
      } else if ((await play.so_validate(query)) === 'track') {
        try {
          const song = await SoundCloudSong.fromURL(query, requester);
          songs.push(song);
          songsCache.set(query, [song]);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid SoundCloud song url');
        }
      } else if ((await play.so_validate(query)) === 'playlist') {
        try {
          const songs = await SoundCloudSong.fromListURL(query, requester);
          songs.push(...songs);
          songsCache.set(query, songs);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid SoundCloud playlist url');
        }
      } else if (URL_REGEX.test(query)) {
        try {
          const song = await URLSong.fromURL(query, requester);
          songs.push(song);
          songsCache.set(query, [song]);
        } catch (error) {
          console.error(error);
          await this.send('🚫 Invalid song url');
        }
      } else {
        try {
          const song = await YouTubeSong.fromSearch(query, requester);
          songs.push(song);
          songsCache.set(query, [song]);
        } catch (error) {
          console.error(error);
          this.send('🚫 Invalid YouTube query');
        }
      }
    }
    songs.forEach(song =>
      'songs' in song ? song.songs.forEach(song => song.log()) : song.log()
    );
    return songs;
  }

  async add(message: Message, query?: string, shuff = false) {
    this.setChannels(message);

    const { channel } = this;
    const queue = await this.getQueue();

    const stuff = await this.getSongs(message, query);
    const songs = stuff.flatMap(song => {
      if ('songs' in song) return song.songs;
      return song;
    });
    queue.push(...(shuff ? shuffle(songs) : songs));

    if (songs.length)
      await channel?.send(
        `⏏️ Added${shuff ? ' & shuffled' : ''} ${songs
          .map(song => song.title)
          .slice(0, 10)
          .join(', ')}${songs.length > 10 ? ', ...' : ''} to queue`
      );

    return this.play();
  }

  async seek(seconds: number) {
    const { stream } = this;
    const { resource, filters } = stream;
    if (!resource) return;

    stream.resource = await resource.metadata.getResource({
      seek: seconds,
      filters
    });
    await this.stream.play();
  }

  async next() {
    await this.play(true);
    await this.channel?.send('⏩ Next');
  }

  async move(from: number, to: number) {
    const queue = await this.getQueue();
    queue.move(from, to);
    return this.send(`➡️ Moved #${from + 2} to #${to + 2}`);
  }

  async stop() {
    this.stream.stop();
    const queue = await this.getQueue();
    queue?.reset();
    this.channel = undefined;
    this.emit('stop');
  }

  async play(skip = false) {
    const { stream } = this;

    if (stream.player.state.status === AudioPlayerStatus.Playing && !skip)
      return;

    const queue = await this.getQueue();
    const song = queue?.next();
    if (!song) {
      await this.send('📭 Queue is empty');
      return this.stop();
    }

    const resource = await song.getResource(stream);
    stream.play(resource);

    try {
      const embed = song.getEmbed().setTitle(`▶️ Playing: ${song.title}`);
      await this.send({
        embeds: [embed]
      });
    } catch (error) {
      console.error('Error creating embed:', error);
    }
  }

  async songQueueEmbed(n: number) {
    const queue = await this.getQueue();
    return queue.songEmbed(n - 1);
  }

  async getLyrics(query?: string) {
    if (query) return getLyrics(query);
    const { current } = await this.getQueue();
    if (current) {
      const { title } = current;
      if (current instanceof SpotifySong)
        return getLyrics(`${title} ${current.artist?.name}`);
      return Promise.resolve(getLyrics(title));
    }
    return Promise.resolve('No song playing');
  }

  setFilters(filters?: string[]) {
    return this.stream.setFilters(filters);
  }

  async playlistSave(message: Message, name: string, query?: string) {
    const queue = await this.getQueue();
    const { author, channel } = message;
    const songs = query
      ? await this.getSongs(message, query)
      : queue.getSongs() || [];
    await playlist.save(author.id, name, songs);
    if (channel.type !== ChannelType.GuildStageVoice)
      await channel.send(`Saved playlist ${name}`);
  }

  async playlistAdd(message: Message, name: string, query?: string) {
    const queue = await this.getQueue();
    const { author, channel } = message;
    const songs = query
      ? await this.getSongs(message, query)
      : queue.getSongs() || [];
    await playlist.add(author.id, name, songs);
    if (channel.type !== ChannelType.GuildStageVoice)
      await channel.send(`Added to playlist ${name}`);
  }
}
