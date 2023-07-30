import { load } from "cheerio";
import ORIGIN from "./origin";

const query = `${ORIGIN}/users/`;
const ao3Regex = new RegExp(`${query}(.+)`);

export function getNameFromURL(url: string): string {
	if (!ao3Regex.test(url)) return "";
	return url.replace(query, "").split(/[#/?]/)[0] || "";
}

export interface User {
	name: string;
	url: string;
	iconURL: string;
}
export async function getUser(name: string): Promise<User> {
	name = name.split("(")[0]?.trim() || "";
	const url = `${query}${name}`;
	const response = await fetch(url);
	const html = await response.text();
	const $ = load(html);

	let iconURL = $("img.icon").attr("src") || "";
	if (!iconURL.startsWith("http")) iconURL = `${ORIGIN}${iconURL}`;

	return {
		name,
		url,
		iconURL,
	};
}
