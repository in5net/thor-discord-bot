import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  InteractionCollector,
  TextChannel
} from 'discord.js';
import { FieldValue, type CollectionReference } from 'firebase-admin/firestore';
import { TypedEmitter } from 'tiny-typed-emitter';

import { createEmbed } from '$services/embed';
import { db } from '$services/firebase';
import { sec2Str } from '$services/time';
import {
  fromJSON,
  type Requester,
  type SongJSONType,
  type SongType
} from './song';
import Voice from './voice';

const pageSize = 5;

const embed = createEmbed();
const backButton = new ButtonBuilder()
  .setCustomId('back')
  .setEmoji('⬅️')
  .setStyle(ButtonStyle.Primary);
const nextButton = new ButtonBuilder()
  .setCustomId('next')
  .setEmoji('➡️')
  .setStyle(ButtonStyle.Primary);
const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
  backButton,
  nextButton
);

const queuesRef = db.collection('queues') as CollectionReference<{
  voiceChannelId?: string;
  current?: SongJSONType & {
    requester: Requester;
  };
  songs: (SongJSONType & {
    requester: Requester;
  })[];
  loop?: boolean;
}>;

export default class Queue extends Array<SongType> {
  current?: SongType;
  loop = false;
  collector: InteractionCollector<ButtonInteraction<'cached'>> | undefined;
  changeEmitter = new TypedEmitter<{
    change: () => void;
  }>();

  private constructor(private voice: Voice) {
    super();
  }

  static async create(voice: Voice) {
    const queue = new Queue(voice);
    const docRef = queuesRef.doc(voice.guildId);
    const doc = await docRef.get();
    const data = doc.data();
    if (data) {
      queue.current = data.current
        ? fromJSON(data.current, data.current.requester)
        : undefined;
      for (let i = 0; i < data.songs.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const song = data.songs[i]!;
        queue[i] = fromJSON(song, song.requester);
      }
    } else
      await docRef.set({
        voiceChannelId: voice.stream.channel?.id,
        songs: []
      });
    return queue;
  }

  get guildId() {
    return BigInt(this.voice.guildId);
  }

  get size(): number {
    return this.length + (this.current ? 1 : 0);
  }

  get docRef() {
    return queuesRef.doc(this.voice.guildId);
  }

  private update() {
    return this.docRef.update({
      songs: this.map(song => ({ ...song.toJSON(), requester: song.requester }))
    });
  }

  getSongs(): SongType[] {
    const songs = [...this];
    const { current } = this;
    if (current) songs.unshift(current);
    return songs;
  }

  push(...items: SongType[]): number {
    const length = super.push(...items);
    this.docRef.update({
      songs: FieldValue.arrayUnion(
        ...items.map(song => ({ ...song.toJSON(), requester: song.requester }))
      )
    });
    return length;
  }

  dequeue(song?: SongType) {
    if (song) {
      const index = this.indexOf(song);
      if (index > -1) this.splice(index, 1);
    } else this.shift();
    this.changeEmitter.emit('change');
    return this.update();
  }

  clear() {
    this.length = 0;
    this.current = undefined;
    this.changeEmitter.emit('change');
    return this.docRef.delete();
  }

  reset() {
    this.clear();
    this.loop = false;
    this.changeEmitter.removeAllListeners();
  }

  next(): SongType | undefined {
    const { current, loop, changeEmitter } = this;
    if (loop && current) this.push(current);
    this.current = this.shift();
    changeEmitter.emit('change');
    this.docRef.update({
      current: this.current
        ? { ...this.current.toJSON(), requester: this.current.requester }
        : FieldValue.delete(),
      songs: this.current
        ? FieldValue.arrayRemove({
            ...this.current.toJSON(),
            requester: this.current.requester
          })
        : undefined
    });
    return this.current;
  }

  shuffle(): void {
    this.sort(() => Math.random() - 0.5);
    this.changeEmitter.emit('change');
    this.update();
  }

  move(from: number, to: number) {
    if (from === to) return;
    const item = this.splice(from, 1)[0];
    if (item) this.splice(to, 0, item);
    this.changeEmitter.emit('change');
    this.update();
  }

  remove(index: number) {
    const [song] = this.splice(index, 1);
    this.changeEmitter.emit('change');
    if (song)
      this.docRef.update({ songs: FieldValue.arrayRemove(song.toJSON()) });
  }

  toggleLoop() {
    const loop = (this.loop = !this.loop);
    this.docRef.update({ loop });
  }

  async embed(channel: TextChannel, seconds?: number) {
    embed.setTitle(`Queue ${this.loop ? '🔁' : ''}`);

    let page = 0;

    const generateEmbed = () => {
      backButton.setDisabled(!page);
      nextButton.setDisabled(page * pageSize + pageSize >= this.length);
      embed.setFields().setFooter({
        text: `Page ${page + 1}/${Math.ceil(this.length / pageSize)}, total: ${
          this.length + (this.current ? 1 : 0)
        }`
      });

      const { current } = this;
      if (current && seconds) {
        const { title, duration = NaN } = current;
        embed.addFields({
          name: `▶️ ${title}`,
          value: `${sec2Str(seconds)}/${sec2Str(duration)}`
        });
      }
      for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
        const song = this[i];
        if (!song) break;
        const { title, duration = NaN } = song;
        embed.addFields({
          name: `${i + 2}. ${title}`,
          value: `${sec2Str(duration)}`
        });
      }
    };
    generateEmbed();

    const message = await channel.send({ embeds: [embed], components: [row] });
    const send = async () => {
      generateEmbed();
      try {
        console.log('Updating queue embed');
        await message.edit({ embeds: [embed], components: [row] });
      } catch (error) {
        console.error(error);
        await channel.send('Failed to update queue embed, try `-queue` again');
        this.collector?.stop();
        this.collector = undefined;
        this.changeEmitter.removeAllListeners();
      }
    };
    this.changeEmitter.removeAllListeners();
    this.changeEmitter.on('change', send);

    this.collector?.stop();
    this.collector = message
      .createMessageComponentCollector({ componentType: ComponentType.Button })
      .on('collect', async i => {
        const { customId } = i;
        if (customId === 'back') page--;
        else if (customId === 'next') page++;
        send();
        await i.update({ files: [] }).catch();
      });
  }

  songEmbed(index: number) {
    const song = index ? this[index - 1] : this.current;
    if (!song) return;
    return song.getEmbed();
  }
}
