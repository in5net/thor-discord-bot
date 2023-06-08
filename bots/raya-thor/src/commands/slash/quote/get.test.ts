import test from "node:test";
import { type SpeechBubble } from "database";
import prisma from "$services/prisma";

await test("quote", async () => {
	const [quote] = await prisma.$queryRaw<[SpeechBubble]>`SELECT *
    FROM SpeechBubble
    ORDER BY RAND()
    LIMIT 1;`;
	console.log(quote);
});
