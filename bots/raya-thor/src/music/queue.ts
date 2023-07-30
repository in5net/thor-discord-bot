/* eslint-disable @typescript-eslint/no-floating-promises */

import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	ComponentType,
	type InteractionCollector,
	type TextChannel,
} from "discord.js";
import { FieldValue, type CollectionReference } from "firebase-admin/firestore";
import { TypedEmitter } from "tiny-typed-emitter";
import logger from "logger";
import {
	fromJSON,
	type Requester,
	type SongJSONType,
	type SongType,
} from "./song";
import type Voice from "./voice";
import { createEmbed } from "$services/embed";
import { firestore } from "$services/firebase";
import { sec2Str } from "$services/time";

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

const queuesReference = firestore.collection("queues") as CollectionReference<{
	voiceChannelId?: string;
	current?: SongJSONType & {
		requester: Requester;
	};
	songs: Array<
		SongJSONType & {
			requester: Requester;
		}
	>;
	loop?: boolean;
}>;

export default class Queue extends Array<SongType> {
	current?: SongType;
	loop = false;
	collector: InteractionCollector<ButtonInteraction<"cached">> | undefined;
	changeEmitter = new TypedEmitter<{
		change: () => void;
	}>();

	private constructor(private readonly voice: Voice) {
		super();
	}

	static async create(voice: Voice) {
		const queue = new Queue(voice);
		const documentReference = queuesReference.doc(voice.guildId);
		const document = await documentReference.get();
		const data = document.data();
		if (data) {
			queue.current = data.current
				? fromJSON(data.current, data.current.requester)
				: undefined;
			for (let i = 0; i < data.songs.length; i++) {
				const song = data.songs[i]!;
				queue[i] = fromJSON(song, song.requester);
			}
		} else
			await documentReference.set({
				voiceChannelId: voice.stream.channel?.id,
				songs: [],
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
		return queuesReference.doc(this.voice.guildId);
	}

	private async update() {
		return this.docRef.update({
			songs: this.map(song => ({
				...song.toJSON(),
				requester: song.requester,
			})),
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
				...items.map(song => ({ ...song.toJSON(), requester: song.requester })),
			),
		});
		return length;
	}

	async dequeue(song?: SongType) {
		if (song) {
			const index = this.indexOf(song);
			if (index > -1) this.splice(index, 1);
		} else this.shift();
		this.changeEmitter.emit("change");
		return this.update();
	}

	async clear() {
		this.length = 0;
		this.current = undefined;
		this.changeEmitter.emit("change");
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
		changeEmitter.emit("change");
		this.docRef.update({
			current: this.current
				? { ...this.current.toJSON(), requester: this.current.requester }
				: FieldValue.delete(),
			songs: this.current
				? FieldValue.arrayRemove({
						...this.current.toJSON(),
						requester: this.current.requester,
				  })
				: undefined,
		});
		return this.current;
	}

	shuffle(): void {
		this.sort(() => Math.random() - 0.5);
		this.changeEmitter.emit("change");
		this.update();
	}

	move(from: number, to: number) {
		if (from === to) return;
		const item = this.splice(from, 1)[0];
		if (item) this.splice(to, 0, item);
		this.changeEmitter.emit("change");
		this.update();
	}

	remove(index: number) {
		const [song] = this.splice(index, 1);
		this.changeEmitter.emit("change");
		if (song)
			this.docRef.update({ songs: FieldValue.arrayRemove(song.toJSON()) });
	}

	toggleLoop() {
		const loop = (this.loop = !this.loop);
		this.docRef.update({ loop });
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
