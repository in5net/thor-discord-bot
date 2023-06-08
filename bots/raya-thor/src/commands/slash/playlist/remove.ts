import command from "discord/commands/slash";
import * as playlist from "../../music/playlist";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Removes your saved named playlist or track #n from that playlist",
		options: {
			name: {
				type: "string",
				desc: "The name of the playlist",
				async autocomplete(search, i) {
					const playlists = await prisma.playlist.findMany({
						select: {
							id: true,
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
					return Object.fromEntries(
						playlists.map(({ id, name }) => [name, id])
					);
				},
			},
			n: {
				type: "int",
				desc: "The track number to remove",
				optional: true,
			},
		},
	},
	async (i, { name, n }) => {
		await playlist.remove(i.user.id, name, n);
		await i.reply({
			content:
				n === undefined
					? `Removed playlist ${name}`
					: `Removed #${n} from playlist ${name}`,
			ephemeral: true,
		});
	}
);
