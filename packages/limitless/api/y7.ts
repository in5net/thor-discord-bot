import { load } from "cheerio";
import { random } from "../math";

export const FILES_ORIGIN = "https://files.yyyyyyy.info";

const nsfw = new Set([`${FILES_ORIGIN}/images/0071-1.gif`]);

export async function getText(): Promise<string> {
	const response = await fetch("https://www.yyyyyyy.info/");
	const html = await response.text();
	const $ = load(html);
	const spans = $("span");
	const span = random(spans.get());
	const source = $(span).text();
	return source;
}

export async function getImg(): Promise<string> {
	const response = await fetch("https://www.yyyyyyy.info/");
	const html = await response.text();
	const $ = load(html);
	const imgs = $("img");
	const images = imgs.filter((_, img) => {
		const source = $(img).attr("src") || "";
		return source.startsWith(FILES_ORIGIN) && !source.endsWith(".gif");
	});
	const image = random(images.get());
	const source = $(image).attr("src") || "";
	return source;
}

export async function getGIF(): Promise<string> {
	const response = await fetch("https://www.yyyyyyy.info/");
	const html = await response.text();
	const $ = load(html);
	const imgs = $("img");
	const images = imgs.filter((_, img) => {
		const source = $(img).attr("src") || "";
		return (
			source.startsWith(FILES_ORIGIN) &&
			source.endsWith(".gif") &&
			!nsfw.has(source)
		);
	});
	const image = random(images.get());
	const source = $(image).attr("src") || "";
	return source;
}
