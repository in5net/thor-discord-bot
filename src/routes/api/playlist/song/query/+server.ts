import { getItemsFromQuery } from "$src/music/plan";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  locals: { user },
  url: { searchParams },
}) => {
  if (!user) {
    error(403, "You are not logged in");
  }

  const query = searchParams.get("q");
  if (!query) {
    error(400, "You must pass a '?q='");
  }

  const result = await getItemsFromQuery(query);

  return json(result);
};
