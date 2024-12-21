import { DISCORD_ID } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals: { authUser } }) => {
  if (authUser) {
    throw redirect(302, "/");
  }
  return {
    DISCORD_ID,
  };
};
