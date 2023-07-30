import command from "discord/commands/slash";
import db, { and, eq, icontains } from "database/drizzle";
import { playlists } from "database/drizzle/schema";
import * as playlist from "$src/music/playlist";

export default command(
	{
		desc: "Removes your saved named playlist or track #n from that playlist",
		options: {
			name: {
				type: "string",
				desc: "The name of the playlist",
				async autocomplete(search, i) {
					const results = await db.query.playlists.findMany({
						columns: {
							id: true,
							name: true,
						},
						where: and(
							eq(playlists.userId, i.user.id),
							icontains(playlists.name, search),
						),
						orderBy: playlists.name,
						limit: 5,
					});
					return Object.fromEntries(results.map(({ id, name }) => [name, id]));
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
	},
);
