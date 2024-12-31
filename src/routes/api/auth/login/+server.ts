import { DISCORD_ID } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url: { origin } }) => {
  const href = `https://discord.com/oauth2/authorize?${new URLSearchParams({
    client_id: DISCORD_ID,
    redirect_uri: `${origin}/api/auth/session`,
    response_type: "code",
    scope: "identify",
  })}`;
  redirect(302, href);
};
