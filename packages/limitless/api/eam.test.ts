import test from "node:test";
import assert from "node:assert";
import { getEpisode, getURL } from "./eam";

await test("get E1S1", async () => {
	const url = getURL("Prologue");
	const episode = await getEpisode(url);
	assert(episode.title === "Prologue");
	assert(typeof episode.words === "number");
});
