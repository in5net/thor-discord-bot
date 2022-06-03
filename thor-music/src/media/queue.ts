import EventEmitter from 'node:events';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import type {
  InteractionCollector,
  MessageComponentInteraction,
  TextChannel
} from 'discord.js';

import { addOwnerUsername, color } from '../config';
import type { MediaType as Media } from './media';

const pageSize = 5;

export default class Queue extends Array<Media> {
  current?: Media;
  loop = false;
  collector: InteractionCollector<MessageComponentInteraction> | undefined;
  changeEmitter = new EventEmitter();

  get size(): number {
    return this.length + (this.current ? 1 : 0);
  }

  getMedias(): Media[] {
    const medias = [...this];
    const { current } = this;
    if (current) medias.unshift(current);
    return medias;
  }

  anyNotRequestedBy(uid: string): boolean {
    return this.getMedias().some(media => media.requester.uid !== uid);
  }

  enqueue(...medias: Media[]) {
    this.push(...medias);
  }
  enqueueNow(...medias: Media[]) {
    this.unshift(...medias);
  }

  dequeue(media?: Media) {
    if (media) {
      const index = this.indexOf(media);
      if (index > -1) this.splice(index, 1);
    } else this.shift();
    this.changeEmitter.emit('change');
  }

  clear() {
    this.length = 0;
    this.current = undefined;
    this.changeEmitter.emit('change');
  }

  next(): Media | undefined {
    const { current, loop, changeEmitter } = this;
    if (loop && current) this.push(current);
    this.current = this.shift();
    changeEmitter.emit('change');
    return this.current;
  }

  shuffle(): void {
    this.sort(() => Math.random() - 0.5);
    this.changeEmitter.emit('change');
  }

  move(from: number, to: number) {
    if (from === to) return;
    const item = this.splice(from, 1)[0];
    if (item) this.splice(to, 0, item);
    this.changeEmitter.emit('change');
  }

  remove(index: number) {
    this.splice(index, 1);
    this.changeEmitter.emit('change');
  }

  toggleLoop() {
    this.loop = !this.loop;
  }

  async embed(channel: TextChannel, timestamp: number) {
    const embed = new MessageEmbed()
      .setTitle(`Queue ${this.loop ? '🔁' : ''}`)
      .setColor(color);
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

    const generateEmbed = () => {
      embed.fields = [];
      backButton.setDisabled(!page);
      nextButton.setDisabled(page * pageSize + pageSize >= this.length);
      embed.setFooter({
        text: `Page ${page + 1}/${Math.ceil(this.length / pageSize)}, total: ${
          this.length + (this.current ? 1 : 0)
        }`
      });
      addOwnerUsername(embed);

      const { current } = this;
      if (current) {
        const { title, duration } = current;
        embed.addField(
          `▶️ ${title}`,
          `${secondsToTime(timestamp / 50_000)}/${secondsToTime(duration)}`
        );
      }
      for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
        const media = this[i];
        if (!media) break;
        const { title, duration } = media;
        embed.addField(`${i + 2}. ${title}`, `${secondsToTime(duration)}`);
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
      .createMessageComponentCollector()
      .on('collect', async i => {
        const { customId } = i;
        if (customId === 'back') page--;
        else if (customId === 'next') page++;
        send();
        await i.update({ files: [] }).catch();
      });
  }

  songEmbed(index: number): MessageEmbed | void {
    const media = index ? this[index - 1] : this.current;
    if (!media) return;
    const embed = media.getEmbed();
    addOwnerUsername(embed);
    return embed;
  }
}

export function secondsToTime(seconds: number): string {
  if (isNaN(seconds)) return 'unknown';
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds - minutes * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
