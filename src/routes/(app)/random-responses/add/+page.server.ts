import db from "$lib/database/drizzle";
import { randomResponses } from "$lib/database/schema";
import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import { z } from "zod";

const formSchema = z.object({
  words: z.string(),
  responses: z.string(),
  chance: z.coerce.number(),
  cooldown: z.coerce.number(),
});

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const { words, responses, chance, cooldown } = formSchema.parse({
      words: data.get("words"),
      responses: data.get("responses"),
      chance: data.get("chance"),
      cooldown: data.get("cooldown"),
    });

    await db.insert(randomResponses).values({
      words,
      responses,
      chance: chance / 100,
      cooldown,
    });

    redirect(302, "/random-responses");
  },
} satisfies Actions;
