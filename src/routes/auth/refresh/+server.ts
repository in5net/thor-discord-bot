import { DISCORD_ID, DISCORD_TOKEN } from "$env/static/private";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  url: { origin, searchParams },
  cookies,
}) => {
  const disco_refresh_token = searchParams.get("code");
  if (!disco_refresh_token) {
    throw error(500, "No refresh token found");
  }

  const request = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: DISCORD_ID,
      client_secret: DISCORD_TOKEN,
      grant_type: "refresh_token",
      redirect_uri: `${origin}/auth/session`,
      scope: "identify email",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const response = await request.json();

  if (response.error) {
    throw error(500, response.error);
  }

  const access_token_expires_in = new Date(Date.now() + response.expires_in); // 10 minutes
  const refresh_token_expires_in = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ); // 30 days
  console.log("set refresh cookies");

  cookies.set("disco_access_token", response.access_token, {
    path: "/",
    sameSite: "strict",
    expires: access_token_expires_in,
  });
  cookies.set("disco_refresh_token", response.refresh_token, {
    path: "/",
    sameSite: "strict",
    expires: refresh_token_expires_in,
  });
  throw json({ disco_access_token: response.access_token });
};
