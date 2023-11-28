/* eslint-disable @typescript-eslint/no-floating-promises */
import { createEmbed } from "$services/embed";
import { sec2Str } from "$services/time";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	type ButtonInteraction,
	type InteractionCollector,
	type TextChannel,
} from "discord.js";
import logger from "logger";
import { TypedEmitter } from "tiny-typed-emitter";
import { type SongType } from "./song";
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
	current?: SongType;
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

	get size(): number {
		return this.length + (this.current ? 1 : 0);
	}

	getSongs(): SongType[] {
		const songs = [...this];
		const { current } = this;
		if (current) songs.unshift(current);
		return songs;
	}

	dequeue(song?: SongType) {
		if (song) {
			const index = this.indexOf(song);
			if (index > -1) this.splice(index, 1);
		} else this.shift();
		this.changeEmitter.emit("change");
	}

	clear() {
		this.length = 0;
		this.current = undefined;
		this.changeEmitter.emit("change");
	}

	reset() {
		this.clear();
		this.loop = false;
		this.changeEmitter.removeAllListeners();
	}

	next() {
		const { current, loop, changeEmitter } = this;
		if (loop && current) this.push(current);
		this.current = this.shift();
		changeEmitter.emit("change");
		return this.current;
	}

	shuffle() {
		this.sort(() => Math.random() - 0.5);
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
		this.changeEmitter.emit("change");
		return song;
	}

	toggleLoop() {
		this.loop = !this.loop;
	}

	async embed(channel: TextChannel, seconds?: number) {
		embed.setTitle(`Queue ${this.loop ? "🔁" : ""}`);

		let page = 0;

		const generateEmbed = () => {
			backButton.setDisabled(!page);
			nextButton.setDisabled(page * pageSize + pageSize >= this.length);
			embed.setFields().setFooter({
				text: `Page ${page + 1}/${Math.ceil(this.length / pageSize)}, total: ${
					this.length + (this.current ? 1 : 0)
				}`,
			});

			const { current } = this;
			if (current && seconds) {
				const { title, duration = Number.NaN } = current;
				embed.addFields({
					name: `▶️ ${title}`,
					value: `${sec2Str(seconds)}/${sec2Str(duration)}`,
				});
			}

			for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
				const song = this[i];
				if (!song) break;
				const { title, duration = Number.NaN } = song;
				embed.addFields({
					name: `${i + 2}. ${title}`,
					value: `${sec2Str(duration)}`,
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
