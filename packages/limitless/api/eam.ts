import { load } from "cheerio";

export const titles = [
	"Prologue",
	"Meeting Winter",
	"Daze Runners",
	"Stalker",
	"Ex-Girlfriend",
	"Dancing in the Dark",
	"There's Something About Mya",
	"She's Plotting Something",
	"The Party",
	"Winter Storm Arising",
	"Daniela Wrecks Christmas",
	"The New Principal",
	"Stacking the Rules",
	"Shocking Secret",
	"Unbroken Love",
	"Rushing Roulette",
	"The Attack",
	"Traitors!",
	"Devil's Dungeon",
	"Your Pain is My Pleasure: Part 1",
	"Your Pain is My Pleasure: Part 2",
	"The Broken Pieces",
	"Good Girl Gone Bad",
	"I Kick It",
	"It's Murder",
	"Behind the Bars",
	"Aftermath",
	"A New Start",
	"Rise of a She-Devil",
	"Little Miss Perfect",
] as const;
export type Title = (typeof titles)[number];

export const ORIGIN = "https://evieandmya.fandom.com/wiki";

export const getURL = (title: Title) =>
	`${ORIGIN}/${title.replaceAll(" ", "_").replaceAll("'", "%27")}`;

interface Episode {
	title: Title;
	words: number;
}
export async function getEpisode(url: string): Promise<Episode> {
	const response = await fetch(url);
	const html = await response.text();
	const $ = load(html);

	const title = $("#firstHeading").text().trim() as Title;

	let element = $("#Transcript").parent().next();
	let words = 0;
	// Loop until we find an <h2> tag
	while (!element.is("h2")) {
		// If it's a <p> tag, get the text
		if (element.is("p")) {
			// Split the text on spaces
			const text = element.text().split(" ");
			// Add the number of words to the total
			words += text.length;
		}

		// Get the next element
		element = element.next();
	}

	return { title, words };
}
