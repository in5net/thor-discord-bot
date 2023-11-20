import { load } from "cheerio";
import ORIGIN from "../origin";

export const query = `${ORIGIN}/works/`;
const ao3Regex = new RegExp(`${query}(\\d+)`);

export function getWorkId(url: string): string {
	if (!ao3Regex.test(url)) return "";
	return url.replace(query, "").split(/[#/?]/)[0] || "";
}

export const ratings = {
	general: "General Audiences",
	teen: "Teen And Up Audiences",
	mature: "Mature",
	explicit: "Explicit",
};
export type Rating = keyof typeof ratings;

export const contentWarnings = {
	choosenot: "Creator Chose Not To Use Archive Warnings",
	violence: "Graphic Depictions of Violence",
	death: "Major Character Death",
	rape: "Rape/Non-Con",
	underage: "Underage Sex",
};
export type Warning = keyof typeof contentWarnings;

export const categories = {
	lesbian: "F/F",
	straight: "F/M",
	gen: "Gen",
	gay: "M/M",
	multi: "Multi",
	other: "Other",
};
export type Category = keyof typeof categories;

export const symbolsOrigin =
	"https://archiveofourown.org/images/skins/iconsets/default/";
export const symbols = {
	rating: {
		general: "rating-general-audience",
		teen: "rating-teen",
		mature: "rating-mature",
		explicit: "rating-explicit",
		none: "rating-notrated",
	},
	category: {
		lesbian: "category-femslash",
		straight: "category-het",
		gen: "category-gen",
		gay: "category-slash",
		multi: "category-multi",
		other: "category-other",
		none: "category-none",
	},
	warning: {
		choosenot: "warning-choosenotto",
		yes: "warning-yes",
		no: "warning-no",
		external: "warning-external-work",
	},
	complete: {
		yes: "complete-yes",
		no: "complete-no",
		unknown: "category-none",
	},
};

type ObjectValues<T> = T[keyof T];

export interface Work {
	id: string;
	title: string;
	author: string;
	rating?: Rating;
	warnings: Warning[];
	categories: Category[];
	fandoms: string[];
	relationships: string[];
	characters: string[];
	tags: string[];
	language: string;
	series?: {
		id: string;
		title: string;
	};
	stats: {
		published: Date;
		updated?: Date;
		words: number;
		chapters: [current: number, total: number];
		kudos: number;
		bookmarks: number;
		hits: number;
	};
	symbols: {
		rating: ObjectValues<typeof symbols.rating>;
		category: ObjectValues<typeof symbols.category>;
		warning: ObjectValues<typeof symbols.warning>;
		complete: ObjectValues<typeof symbols.complete>;
	};
}
export async function getWork(id: string): Promise<Work> {
	const response = await fetch(`${query}${id}?view_adult=true`);
	const html = await response.text();
	const $ = load(html);

	const rating = $(
		"#main > div.wrapper > dl > dd.rating.tags > ul > li > a",
	).text();
	const warnings = $("#main > div.wrapper > dl > dd.warning.tags a")
		.map((_, el) => $(el).text())
		.get();
	const categories = $("#main > div.wrapper > dl > dd.category.tags > ul a")
		.map((_, el) => $(el).text())
		.get();
	const series = $(
		"#main div.wrapper > dl > dd.series > span > span.position > a",
	);
	const stats = $("#main div.wrapper > dl > dd.stats > dl");
	const status = stats.find("dd.status").text();

	const work = {
		id,
		title: $("h2.title").text(),
		author: $("#workskin > div.preface.group > h3 > a").text(),
		rating: Object.entries(ratings).find(([, x]) => rating === x)?.[0] as
			| Rating
			| undefined,
		warnings:
			warnings[0] === "No Archive Warnings Apply"
				? []
				: (warnings.map(
						warning =>
							Object.entries(contentWarnings).find(
								([, x]) => warning === x,
							)?.[0],
				  ) as Warning[]),
		categories: categories.map(
			category =>
				Object.entries(categories).find(([, x]) => category === x)?.[0] ||
				"other",
		) as Category[],
		fandoms: $("#main > div.wrapper > dl > dd.fandom.tags > ul > li > a")
			.map((_, el) => $(el).text())
			.get(),
		relationships: $("#main > div.wrapper > dl > dd.relationship.tags > ul a")
			.map((_, el) => $(el).text() as Category)
			.get(),
		characters: $("#main > div.wrapper > dl > dd.character.tags > ul a")
			.map((_, el) => $(el).text())
			.get(),
		tags: $("#main > div.wrapper > dl > dd.freeform.tags > ul a")
			.map((_, el) => $(el).text())
			.get(),
		language: $("#main > div.wrapper > dl > dd.language").text().trim(),
		series: series
			? {
					id: series.attr("href")?.replace("/series/", "") || "",
					title: series.text(),
			  }
			: undefined,
		stats: {
			published: new Date(`${stats.find("dd.published").text()} `),
			updated: status ? new Date(`${status} `) : undefined,
			words: Number.parseInt(stats.find("dd.words").text()),
			chapters: stats
				.find("dd.chapters")
				.text()
				.split("/")
				.map(x => Number.parseInt(x)) as [number, number],
			kudos: Number.parseInt(stats.find("dd.kudos").text()),
			bookmarks: Number.parseInt(stats.find("dd.bookmarks a").text()),
			hits: Number.parseInt(stats.find("dd.h").text()),
		},
	};
	return {
		...work,
		symbols: {
			rating: symbols.rating[work.rating || "none"],
			category:
				work.categories.length > 1
					? symbols.category.multi
					: symbols.category[work.categories[0] || "none"],
			warning:
				symbols.warning[
					work.warnings ? (work.warnings.length ? "yes" : "no") : "choosenot"
				],
			complete:
				symbols.complete[
					work.stats.chapters[0] >= work.stats.chapters[1] ? "yes" : "no"
				],
		},
	};
}

export async function getWorks(ids: string[]): Promise<Work[]> {
	const works: Work[] = [];
	for (const id of ids) {
		works.push(await getWork(id));
	}

	return works;
}
