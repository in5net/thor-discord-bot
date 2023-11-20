import ORIGIN from "./origin";

const ENDPOINT = `${ORIGIN}/autocomplete/fandom`;

export interface Fandom {
	id: string;
	name: string;
}

type Response = Fandom[];
export async function searchFandoms(term: string) {
	if (!term) return [];
	const url = new URL(ENDPOINT);
	url.searchParams.set("term", term);
	const response = await fetch(url);
	const fandoms = (await response.json()) as Response;
	return fandoms;
}
