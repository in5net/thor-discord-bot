import { join } from 'path';
import { readdir } from 'fs/promises';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus
} from '@discordjs/voice';
import { Downloader } from '@discord-player/downloader';
import play from 'play-dl';
import {
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageOptions,
  TextChannel,
  VoiceChannel
} from 'discord.js';
import { shuffle } from '@limitlesspc/limitless';
import type { AudioResource } from '@discordjs/voice';

import Queue, { secondsToTime } from './queue';
import client from '../client';
import { getLyrics } from '../genius';
import { SoundCloudMedia, SpotifyMedia, URLMedia, YouTubeMedia } from './media';
import * as playlist from './playlist';
import { addOwnerUsername, color } from '../config';
import '../env';
import type { MediaType } from './media';

export default class Player {
  private player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Stop
    }
  })
    .on(AudioPlayerStatus.Idle, () => {
      if (!this.soundboardCollector) this.play();
    })
    .on('error', async error => {
      console.error('⚠️ Player error:', error);
      await this.send('⚠️ Error');
      await this.next();
    });

  private channel?: TextChannel;
  private voiceChannel?: VoiceChannel;
  private connection?: VoiceConnection;
  private message?: Message;
  private soundboardCollector:
    | InteractionCollector<MessageComponentInteraction>
    | undefined;
  private playlistGetCollector:
    | InteractionCollector<MessageComponentInteraction>
    | undefined;

  readonly queue = new Queue();
  private timestamp = 0;

  constructor(private onStop: () => void) {}

  async send(message: string | MessageOptions): Promise<void> {
    await this.message?.delete().catch(() => {});
    this.message = await this.channel?.send(message);
  }

  setChannels(message: Message): void {
    const { channel, member } = message;
    if (channel.type === 'GUILD_TEXT') this.channel = channel;
    const voiceChannel = member?.voice.channel;
    if (voiceChannel?.type === 'GUILD_VOICE') this.voiceChannel = voiceChannel;
  }

  async getMedias(message: Message, query?: string): Promise<MediaType[]> {
    const { player, queue } = this;
    const { author, member, attachments } = message;
    const requester = {
      uid: author.id,
      name: member?.nickname || author.username
    };

    const urlMediasCache = new Map<string, URLMedia>();
    for (const { url } of attachments.values()) {
      let media = urlMediasCache.get(url);
      if (!media) {
        media = await URLMedia.fromURL(url, requester);
        urlMediasCache.set(url, media);
      }
      queue.enqueue(media);
      media.log();
      if (player.state.status === AudioPlayerStatus.Playing)
        await this.send(`⏏️ Added ${media.title} to queue`);
    }

    const queries: string[] = [];
    if (query) {
      const words = query.split(' ');
      let text = '';
      for (const word of words) {
        const isUrl = Downloader.validate(word);
        if (isUrl) {
          if (text) {
            queries.push(text.trim());
            text = '';
          }
          queries.push(word);
        } else text += `${word} `;
      }
      if (text) {
        queries.push(text.trim());
        text = '';
      }
    }
    console.log('Queries:', queries);

    const medias: MediaType[] = [];
    const mediasCache = new Map<string, MediaType[]>();
    if (play.is_expired()) await play.refreshToken();
    for (const query of queries) {
      const mds = mediasCache.get(query);
      if (mds) {
        medias.push(...mds);
        continue;
      }
      if (play.yt_validate(query) === 'playlist') {
        const id = play.extractID(query);
        try {
          const videos = await YouTubeMedia.fromPlaylistId(id, requester);
          medias.push(...videos);
          mediasCache.set(query, videos);
        } catch (error) {
          await this.send('🚫 Invalid YouTube playlist url');
        }
      } else if (play.yt_validate(query) === 'video') {
        try {
          const media = await YouTubeMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid YouTube video url');
        }
      } else if (play.sp_validate(query) === 'track') {
        try {
          const media = await SpotifyMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid Spotify song url');
        }
      } else if (
        ['album', 'playlist'].includes(play.sp_validate(query) as string)
      ) {
        try {
          const songs = await SpotifyMedia.fromListURL(query, requester);
          medias.push(...songs);
          mediasCache.set(query, songs);
        } catch {
          await this.send('🚫 Invalid Spotify album/playlist url');
        }
      } else if ((await play.so_validate(query)) === 'track') {
        try {
          const media = await SoundCloudMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid SoundCloud song url');
        }
      } else if ((await play.so_validate(query)) === 'playlist') {
        try {
          const medias = await SoundCloudMedia.fromListURL(query, requester);
          medias.push(...medias);
          mediasCache.set(query, medias);
        } catch {
          await this.send('🚫 Invalid SoundCloud playlist url');
        }
      } else if (Downloader.validate(query)) {
        try {
          const media = await URLMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid song url');
        }
      } else {
        try {
          const media = await YouTubeMedia.fromSearch(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          this.send('🚫 Invalid YouTube query');
        }
      }
    }
    medias.forEach(media => media.log());
    return medias;
  }

  async add(message: Message, query?: string, shuffle = false): Promise<void> {
    this.setChannels(message);

    const { queue, channel } = this;

    const medias = await this.getMedias(message, query);
    queue.enqueue(...medias);
    if (shuffle) queue.shuffle();

    if (medias.length)
      await channel?.send(
        `⏏️ Added${shuffle ? ' & shuffled' : ''} ${medias
          .map(media => media.title)
          .slice(0, 10)
          .join(', ')}${medias.length > 10 ? ', ...' : ''} to queue`
      );

    return this.play();
  }

  async playnow(message: Message, query?: string): Promise<void> {
    this.setChannels(message);

    const { queue, channel } = this;

    const medias = await this.getMedias(message, query);
    queue.enqueueNow(...medias);

    if (medias.length)
      await channel?.send(
        `⏏️ Added ${medias
          .map(media => media.title)
          .slice(0, 10)
          .join(', ')}${
          medias.length > 10 ? ', ...' : ''
        } to the front of the queue`
      );

    return this.play(true);
  }

  async next(uid?: string): Promise<void> {
    if (
      uid &&
      this.queue.current?.requester === process.env.DISCORD_UID &&
      uid !== process.env.DISCORD_UID
    ) {
      await this.channel?.send(
        'My boss requested the currently playing song, so no.'
      );
      return;
    }

    await this.play(true);
    await this.channel?.send('⏩ Next');
  }

  async pause(uid: string): Promise<void> {
    if (
      uid &&
      this.queue.current?.requester === process.env.DISCORD_UID &&
      uid !== process.env.DISCORD_UID
    ) {
      await this.channel?.send(
        'My boss requested the currently playing song, so no.'
      );
      return;
    }

    const { player, channel } = this;
    const paused = player.state.status === AudioPlayerStatus.Paused;
    if (paused) await player.unpause();
    else await player.pause(true);
    await channel?.send(paused ? '⏯️ Resumed' : '⏸️ Paused');
  }

  toggleLoop(): Promise<void> {
    this.queue.toggleLoop();
    return this.send(`🔁 Loop ${this.queue.loop ? 'enabled' : 'disabled'}`);
  }

  shuffle(): Promise<void> {
    this.queue.shuffle();
    return this.send('🔀 Shuffled queue');
  }

  move(from: number, to: number): Promise<void> {
    this.queue.move(from, to);
    return this.send(`➡️ Moved #${from + 2} to #${to + 2}`);
  }

  remove(index: number): Promise<void> {
    this.queue.remove(index);
    return this.send(`✂️ Removed #${index + 2}`);
  }

  async stop(uid?: string): Promise<void> {
    const { player, connection, queue, onStop } = this;
    if (
      uid &&
      queue.current?.requester === process.env.DISCORD_UID &&
      uid !== process.env.DISCORD_UID
    ) {
      await this.channel?.send(
        'My boss requested the currently playing song, so no.'
      );
      return;
    }
    if (
      connection &&
      connection.state.status !== VoiceConnectionStatus.Destroyed
    )
      connection.destroy();
    player.stop();
    queue.clear();
    queue.loop = false;
    this.soundboardCollector?.stop();
    this.channel =
      this.voiceChannel =
      this.connection =
      this.soundboardCollector =
        undefined;
    client.user?.setActivity();
    this.queue.changeEmitter.removeAllListeners();
    onStop();
  }

  async soundboard(message: Message): Promise<void> {
    const soundsPath = join(__dirname, '../../sounds');
    const fileNames = await readdir(soundsPath);
    const soundNames = fileNames.map(fileName => fileName.replace('.ogg', ''));
    const shuffledNames = shuffle(soundNames).slice(0, 4 * 5);

    const buttons = shuffledNames.map(soundName =>
      new MessageButton()
        .setCustomId(soundName)
        .setLabel(soundName)
        .setStyle('PRIMARY')
    );
    const rows: MessageActionRow[] = [];
    const columns = 4;
    for (let i = 0; i < buttons.length; i += columns) {
      const row: MessageActionRow = new MessageActionRow();
      row.addComponents(buttons.slice(i, i + columns));
      rows.push(row);
    }

    this.setChannels(message);
    await this.send({ content: '🎵 Soundboard', components: rows });
    console.log(`🎵 Soundboard created`);
    this.soundboardCollector?.stop();
    this.soundboardCollector = this.message
      ?.createMessageComponentCollector()
      .on('collect', async i => {
        if (i.customId === 'stop') {
          this.soundboardCollector?.stop();
          this.soundboardCollector = undefined;
          return;
        }
        this.joinVoice();

        const soundName = i.customId;
        console.log('Sound:', soundName);
        const soundPath = join(soundsPath, `${soundName}.ogg`);
        const resource = createAudioResource(soundPath, {
          inputType: StreamType.OggOpus
        });
        this.player.play(resource);

        try {
          await i?.update({});
        } catch (error) {
          console.error('Interaction error:', error);
        }
      });
  }

  private joinVoice() {
    const { player, voiceChannel } = this;
    if (!voiceChannel) return;
    if (!this.connection) {
      this.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      }).once(VoiceConnectionStatus.Disconnected, () => this.stop());
      this.connection.subscribe(player);
    }
  }

  private async play(skip = false): Promise<void> {
    const { player, queue } = this;

    if (this.soundboardCollector) {
      this.soundboardCollector.stop();
      this.soundboardCollector = undefined;
    }

    this.joinVoice();

    if (player.state.status === AudioPlayerStatus.Playing && !skip) return;

    const media = queue.next();
    if (!media) {
      await this.send('📭 Queue is empty');
      return this.stop();
    }

    const { title } = media;
    let resource: AudioResource;
    if (media instanceof YouTubeMedia || media instanceof SpotifyMedia) {
      if (play.is_expired()) await play.refreshToken();
    }
    if (media instanceof YouTubeMedia || media instanceof SoundCloudMedia) {
      const { url } = media;
      const stream = await play.stream(url, {
        seek: media instanceof YouTubeMedia ? media.time : undefined
      });
      resource = createAudioResource(stream.stream, { inputType: stream.type });
      console.log(`▶️ Playing ${url}`);
    } else if (media instanceof SpotifyMedia) {
      const stream = await play.stream(media.youtubeURL);
      resource = createAudioResource(stream.stream, { inputType: stream.type });
      console.log(`▶️ Playing ${media.url}`);
    } else if (media instanceof URLMedia) {
      const stream = Downloader.download(media.url);
      resource = createAudioResource(stream);
      console.log(`▶️ Playing ${media.url}`);
    } else {
      resource = createAudioResource(media.path);
      console.log(`▶️ Playing ${media.path}`);
    }

    player.play(resource);
    this.timestamp = 0;
    player.once(AudioPlayerStatus.Playing, () => {
      this.timestamp = this.connection?.receiver.connectionData.timestamp || 0;
    });
    client.user?.setActivity(title);

    const embed = media.getEmbed().setTitle(`▶️ Playing: ${title}`);
    addOwnerUsername(embed);
    return this.send({
      embeds: [embed]
    });
  }

  async queueEmbed(message: Message): Promise<void> {
    this.setChannels(message);
    const { channel, connection, queue, timestamp } = this;
    if (channel)
      await queue.embed(
        channel,
        (connection?.receiver.connectionData.timestamp || 0) - timestamp
      );
  }

  songQueueEmbed(n: number): MessageEmbed | void {
    return this.queue.songEmbed(n - 1);
  }

  async lyrics(message: Message, query?: string): Promise<void> {
    this.setChannels(message);
    const lyrics = await this.getLyrics(query);
    if (lyrics.length <= 2000) return this.send(lyrics);
    return this.send({
      files: [new MessageAttachment(Buffer.from(lyrics), 'lyrics.txt')]
    });
  }

  private getLyrics(query?: string) {
    if (query) return getLyrics(query);
    const { current } = this.queue;
    if (current) {
      const { title } = current;
      if (current instanceof SpotifyMedia)
        return getLyrics(`${title} ${current.artist.name}`);
      return Promise.resolve(getLyrics(title));
    }
    return Promise.resolve('No song playing');
  }

  async playlistGet(
    { author, member, channel }: Message,
    name: string
  ): Promise<void> {
    const medias = await playlist.get(
      {
        uid: author.id,
        name: member?.nickname || author.username
      },
      name
    );
    const { length } = medias;

    const embed = new MessageEmbed()
      .setTitle('Tracks')
      .setColor(color)
      .setAuthor({
        name: author.username,
        iconURL: author.avatarURL() || undefined
      });
    const backButton = new MessageButton()
      .setCustomId('back')
      .setEmoji('⬅️')
      .setStyle('PRIMARY');
    const nextButton = new MessageButton()
      .setCustomId('next')
      .setEmoji('➡️')
      .setStyle('PRIMARY');
    const row = new MessageActionRow().addComponents(backButton, nextButton);

    let page = 0;
    const pageSize = 5;

    const generateEmbed = () => {
      embed.fields = [];
      backButton.setDisabled(!page);
      nextButton.setDisabled(page * pageSize + pageSize >= length);
      embed.setFooter({
        text: `Page ${page + 1}/${Math.ceil(
          length / pageSize
        )}, total: ${length}`
      });
      addOwnerUsername(embed);

      for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
        const media = medias[i];
        if (!media) break;
        const { title, duration } = media;
        embed.addField(`${i + 1}. ${title}`, `${secondsToTime(duration)}`);
      }
    };
    generateEmbed();

    const message = await channel.send({ embeds: [embed], components: [row] });
    this.playlistGetCollector?.stop();
    this.playlistGetCollector = message
      .createMessageComponentCollector({ time: 60_000 })
      .on('collect', async i => {
        const { customId } = i;
        if (customId === 'back') page--;
        else if (customId === 'next') page++;
        generateEmbed();
        await message.edit({ embeds: [embed], components: [row] });
        await i.update({ files: [] });
      });
  }

  async playlistList({ author, channel }: Message): Promise<void> {
    const playlists = await playlist.list(author.id);
    const desc = playlists.join('\n');
    const embed = new MessageEmbed()
      .setTitle('Playlists')
      .setColor(color)
      .setAuthor({
        name: author.username,
        iconURL: author.avatarURL() || undefined
      })
      .setDescription(desc.length > 1000 ? `${desc.slice(0, 1000)}...` : desc);
    addOwnerUsername(embed);
    await channel.send({ embeds: [embed] });
  }

  async playlistSave(
    message: Message,
    name: string,
    query?: string
  ): Promise<void> {
    const { author, channel } = message;
    const medias = await this.getMedias(message, query);
    await playlist.save(author.id, name, medias);
    await channel.send(`Saved playlist ${name}`);
  }

  async playlistAdd(
    message: Message,
    name: string,
    query?: string
  ): Promise<void> {
    const { author, member, channel } = message;
    const medias = await this.getMedias(message, query);
    await playlist.add(
      {
        uid: author.id,
        name: member?.nickname || author.username
      },
      name,
      medias
    );
    await channel.send(`Added to playlist ${name}`);
  }

  async playlistLoad(message: Message, name: string): Promise<void> {
    this.setChannels(message);
    const { author, member } = message;
    const medias = await playlist.get(
      {
        uid: author.id,
        name: member?.nickname || author.username
      },
      name
    );
    this.queue.enqueue(...medias);
    return this.play();
  }

  async playlistLoads(message: Message, name: string): Promise<void> {
    this.setChannels(message);
    const { author, member } = message;
    const medias = await playlist.get(
      {
        uid: author.id,
        name: member?.nickname || author.username
      },
      name
    );
    this.queue.enqueue(...shuffle(medias));
    return this.play();
  }

  async playlistRemove(
    { author, member, channel }: Message,
    name: string,
    n?: number
  ): Promise<void> {
    await playlist.remove(
      {
        uid: author.id,
        name: member?.nickname || author.username
      },
      name,
      n
    );
    await channel.send(
      n === undefined
        ? `Removed playlist ${name}`
        : `Removed #${n} from playlist ${name}`
    );
  }
}
