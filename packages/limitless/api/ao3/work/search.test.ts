import assert from "node:assert";
import test from "node:test";
import { Category, OrderBy, searchWorks } from "./search";

await test("search work", async () => {
	const works = await searchWorks({
		complete: true,
		crossovers: false,
		language: "en",
		categories: [Category.Lesbian],
		relationships: ["Amity Blight/Luz Noceda"],
		orderBy: OrderBy.Kudos,
	});
	console.log(works);
	assert(works);
});
