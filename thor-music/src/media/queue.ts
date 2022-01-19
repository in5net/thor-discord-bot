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

  get size(): number {
    return this.length + (this.current ? 1 : 0);
  }

  getMedias(): Media[] {
    const medias = [...this];
    const { current } = this;
    if (current) medias.unshift(current);
    return medias;
  }

  enqueue(...medias: Media[]): void {
    this.push(...medias);
  }

  dequeue(media?: Media): void {
    if (media) {
      const index = this.indexOf(media);
      if (index > -1) this.splice(index, 1);
    } else this.shift();
  }

  clear(): void {
    this.length = 0;
    this.current = undefined;
  }

  next(n = 1): Media | undefined {
    const { current, loop } = this;
    if (loop && current) this.push(current);
    for (let i = 0; i < n; i++) {
      this.current = this.shift();
    }
    return this.current;
  }

  shuffle(): void {
    this.sort(() => Math.random() - 0.5);
  }

  move(from: number, to: number): void {
    if (from === to) return;
    const item = this.splice(from, 1)[0];
    if (item) this.splice(to, 0, item);
  }

  remove(index: number): void {
    this.splice(index, 1);
  }

  toggleLoop(): void {
    this.loop = !this.loop;
  }

  async embed(channel: TextChannel, timestamp: number): Promise<void> {
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
    this.collector?.stop();
    this.collector = message
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
