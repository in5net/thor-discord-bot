import {
    getUser,
    searchCharacters,
    searchFandoms,
    searchRelationships,
    searchTags,
} from "@in5net/limitless/api/ao3";
import {
    Category,
    OrderBy,
    Rating,
    Warning,
    searchWorks,
} from "@in5net/limitless/api/ao3/work/search";
import command from "discord/commands/slash";
import { createWorkEmbedBuilder } from "./embed";

export default command(
	{
		desc: "Get information on a work from Archive of Our Own",
		options: {
			title: {
				type: "string",
				desc: "Search by title",
				optional: true,
			},
			author: {
				type: "string",
				desc: "Search by author",
				optional: true,
			},
			complete: {
				type: "bool",
				desc: "Only show completed works",
				optional: true,
			},
			crossovers: {
				type: "bool",
				desc: "Allow crossovers",
				optional: true,
			},
			single_chapter: {
				type: "bool",
				desc: "Only show single chapter works",
				optional: true,
			},
			fandom: {
				type: "string",
				desc: "Fandom name to search for",
				optional: true,
				async autocomplete(query) {
					const fandoms = await searchFandoms(query);
					return fandoms.map(({ id }) => id);
				},
			},
			rating: {
				type: "choice",
				desc: "Rating to search for",
				choices: Rating,
				optional: true,
			},
			warning: {
				type: "choice",
				desc: "Warning tag to search for",
				choices: Warning,
				optional: true,
			},
			category: {
				type: "choice",
				desc: "Category name to search for",
				choices: Category,
				optional: true,
			},
			relationship: {
				type: "string",
				desc: "Relationship to search for",
				optional: true,
				async autocomplete(query) {
					const relationships = await searchRelationships(query);
					return relationships
						.map(({ id }) => id)
						.filter(id => id.length <= 100);
				},
			},
			character: {
				type: "string",
				desc: "Character to search for",
				optional: true,
				async autocomplete(query) {
					const characters = await searchCharacters(query);
					return characters.map(({ id }) => id).filter(id => id.length <= 100);
				},
			},
			tag: {
				type: "string",
				desc: "Tag to search for",
				optional: true,
				async autocomplete(query) {
					const tags = await searchTags(query);
					return tags.map(({ id }) => id).filter(id => id.length <= 100);
				},
			},
			order_by: {
				type: "choice",
				desc: "Order the search by a field",
				choices: OrderBy,
				optional: true,
			},
			order: {
				type: "choice",
				desc: "Order the search by a direction",
				choices: ["asc", "desc"] as const,
				optional: true,
			},
		},
	},
	async (
		i,
		{
			title,
			author,
			complete,
			crossovers,
			single_chapter,
			fandom,
			rating,
			warning,
			category,
			relationship,
			character,
			tag,
			order_by,
			order,
		},
	) => {
		const works = await searchWorks({
			title,
			author,
			complete,
			crossovers,
			singleChapter: single_chapter,
			fandoms: fandom ? [fandom] : undefined,
			rating,
			warnings: warning ? [warning] : undefined,
			categories: category ? [category] : undefined,
			relationships: relationship ? [relationship] : undefined,
			characters: character ? [character] : undefined,
			tags: tag ? [tag] : undefined,
			orderBy: order_by,
			order,
		});

		if (works.length === 0)
			return i.reply({ content: "No results found", ephemeral: true });

		const embeds = await Promise.all(
			works.slice(0, 5).map(async work => {
				const author = await getUser(work.author);
				return createWorkEmbedBuilder(work, author);
			}),
		);
		return i.reply({ embeds, ephemeral: true });
	},
);
