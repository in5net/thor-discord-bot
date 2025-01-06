import db, { eq } from "$lib/database/drizzle";
import { randomResponses } from "$lib/database/schema";
import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { z } from "zod";

export const load: PageServerLoad = async ({
  parent,
  params: { responseId },
}) => {
  await parent();

  const response = await db.query.randomResponses.findFirst({
    columns: {
      id: true,
      words: true,
      responses: true,
      chance: true,
      cooldown: true,
    },
    where: eq(randomResponses.id, Number.parseInt(responseId)),
  });
  if (!response) {
    error(404, "Random response not found");
  }
  return {
    response,
  };
};

const formSchema = z.object({
  words: z.string(),
  responses: z.string(),
  chance: z.coerce.number(),
  cooldown: z.coerce.number(),
});

export const actions = {
  save: async ({ request, params: { responseId } }) => {
    const data = await request.formData();
    const { words, responses, chance, cooldown } = formSchema.parse({
      words: data.get("words"),
      responses: data.get("responses"),
      chance: data.get("chance"),
      cooldown: data.get("cooldown"),
    });

    const where = eq(randomResponses.id, Number.parseInt(responseId));
    const response = await db.query.randomResponses.findFirst({
      columns: {
        id: true,
      },
      where,
    });
    if (!response) {
      error(404, "Random response not found");
    }

    await db
      .update(randomResponses)
      .set({
        words,
        responses,
        chance: chance / 100,
        cooldown,
      })
      .where(where);

    redirect(302, "/random-responses");
  },
  delete: async ({ params: { responseId } }) => {
    const where = eq(randomResponses.id, Number.parseInt(responseId));
    const response = await db.query.randomResponses.findFirst({
      columns: {
        id: true,
      },
      where,
    });
    if (!response) {
      error(404, "Random response not found");
    }

    await db.delete(randomResponses).where(where);

    redirect(302, "/random-responses");
  },
} satisfies Actions;
