import ORIGIN from "./origin";

const ENDPOINT = `${ORIGIN}/autocomplete/character`;

export interface Character {
	id: string;
	name: string;
}

type Response = Character[];
export async function searchCharacters(term: string) {
	if (!term) return [];
	const url = new URL(ENDPOINT);
	url.searchParams.set("term", term);
	const response = await fetch(url);
	const characters = (await response.json()) as Response;
	return characters;
}
