/* eslint-disable ts/no-floating-promises */
import { createEmbed } from "$lib/embed";
import { formatTime } from "$lib/time";
import { remove } from "@in5net/std/array";
import { shuffle } from "@in5net/std/random";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type ButtonInteraction,
  type InteractionCollector,
  type TextChannel,
} from "discord.js";
import logger from "$lib/logger";
import { TypedEmitter } from "tiny-typed-emitter";
import { type SongType } from "./songs";
import type Voice from "./voice";

const pageSize = 5;

const embed = createEmbed();
const backButton = new ButtonBuilder()
  .setCustomId("back")
  .setEmoji("⬅️")
  .setStyle(ButtonStyle.Primary);
const nextButton = new ButtonBuilder()
  .setCustomId("next")
  .setEmoji("➡️")
  .setStyle(ButtonStyle.Primary);
const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
  backButton,
  nextButton,
);

export default class Queue extends Array<SongType> {
  currentIndex = -1;
  loop = false;
  collector: InteractionCollector<ButtonInteraction<"cached">> | undefined;
  changeEmitter = new TypedEmitter<{
    change: () => void;
  }>();

  constructor(private readonly voice: Voice) {
    super();
  }

  get guildId() {
    return BigInt(this.voice.guildId);
  }

  get left() {
    return this.length - this.currentIndex;
  }

  get current() {
    return this[this.currentIndex];
  }

  dequeue(song?: SongType) {
    if (song) remove(this, song);
    else this.shift();
    this.changeEmitter.emit("change");
  }

  clear() {
    this.length = 0;
    this.currentIndex = -1;
    this.changeEmitter.emit("change");
  }

  reset() {
    this.clear();
    this.loop = false;
    this.changeEmitter.removeAllListeners();
  }

  hasNext() {
    if (this.loop) return !!this.length;
    return this.currentIndex + 1 < this.length;
  }

  hasPrev() {
    if (this.loop) return !!this.length;
    return this.currentIndex - 1 >= 0;
  }

  next() {
    const { loop, length, changeEmitter } = this;
    this.currentIndex++;
    if (loop && this.currentIndex >= length) this.currentIndex = 0;
    changeEmitter.emit("change");
    return this.current;
  }

  prev() {
    const { loop, length, changeEmitter } = this;
    this.currentIndex--;
    if (loop && this.currentIndex < 0) this.currentIndex = length - 1;
    changeEmitter.emit("change");
    return this.current;
  }

  shuffle() {
    shuffle(this);
    this.currentIndex = 0;
    this.changeEmitter.emit("change");
  }

  move(from: number, to: number) {
    if (from === to) return;
    const item = this.splice(from, 1)[0];
    if (item) this.splice(to, 0, item);
    this.changeEmitter.emit("change");
  }

  remove(index: number) {
    const [song] = this.splice(index, 1);
    if (index < this.currentIndex) this.currentIndex--;
    this.changeEmitter.emit("change");
    return song;
  }

  toggleLoop() {
    this.loop = !this.loop;
  }

  async embed(channel: TextChannel, seconds?: number) {
    embed.setTitle(`Queue ${this.loop ? "🔁" : ""}`);

    let page = Math.floor(this.currentIndex / pageSize);

    const generateEmbed = () => {
      backButton.setDisabled(!page);
      nextButton.setDisabled(page * pageSize + pageSize >= this.length);
      embed.setFields().setFooter({
        text: `Page ${page + 1}/${Math.ceil(this.length / pageSize)}, total: ${
          this.length + (this.current ? 1 : 0)
        }`,
      });

      for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
        const song = this[i];
        if (!song) break;
        const { title, duration = Number.NaN } = song;
        if (i === this.currentIndex && seconds)
          embed.addFields({
            name: `▶️ ${i + 1}. ${title}`,
            value: `${formatTime(seconds)}/${formatTime(duration)}`,
          });
        else
          embed.addFields({
            name: `${i + 1}. ${title}`,
            value: `${formatTime(duration)}`,
          });
      }
    };

    generateEmbed();

    const message = await channel.send({ embeds: [embed], components: [row] });
    const send = async () => {
      generateEmbed();
      try {
        logger.info("Updating queue embed");
        await message.edit({ embeds: [embed], components: [row] });
      } catch (error) {
        logger.error(error);
        await channel.send("Failed to update queue embed, try `-queue` again");
        this.collector?.stop();
        this.collector = undefined;
        this.changeEmitter.removeAllListeners();
      }
    };

    this.changeEmitter.removeAllListeners();
    this.changeEmitter.on("change", send);

    this.collector?.stop();
    this.collector = message
      .createMessageComponentCollector({ componentType: ComponentType.Button })
      .on("collect", async i => {
        const { customId } = i;
        if (customId === "back") page--;
        else if (customId === "next") page++;
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
