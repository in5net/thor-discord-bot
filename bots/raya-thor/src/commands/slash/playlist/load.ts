import { shuffle } from "@in5net/limitless";
import { ChannelType, GuildMember } from "discord.js";
import command from "discord/commands/slash";
import * as playlist from "$src/music/playlist";
import { getVoice } from "$src/music/voice-manager";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Loads your playlist into the queue",
		options: {
			name: {
				type: "string",
				desc: "The name of the playlist",
				async autocomplete(search, i) {
					const playlists = await prisma.playlist.findMany({
						select: {
							name: true,
						},
						where: {
							userId: i.user.id,
							name: {
								contains: search,
							},
						},
						orderBy: {
							name: "asc",
						},
						take: 5,
					});
					return playlists.map(({ name }) => name);
				},
			},
			shuffle: {
				type: "bool",
				desc: "Shuffle the playlist",
				optional: true,
			},
		},
		permissions: ["vc"],
	},
	async (i, { name, shuffle: doShuffle }) => {
		const { guildId, member, user } = i;
		if (!guildId || !(member instanceof GuildMember)) return;
		const voice = getVoice(guildId);

		const songs = await playlist
			.get(
				{
					uid: user.id,
					name: member?.nickname || user.username,
				},
				name,
			)
			.catch(() => []);

		const queue = await voice.getQueue();
		queue.push(...(doShuffle ? shuffle(songs) : songs));
		await i.reply(`Loaded ${songs.length} songs`);
		if (member.voice.channel?.type === ChannelType.GuildVoice)
			voice.stream.channel = member.voice.channel;
		return voice.play();
	},
);
