import { DISCORD_CLIENT_SECRET, DISCORD_ID } from "$env/static/private";
import { tokenSchema } from "../shared";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { OAuth2Routes, RouteBases } from "discord-api-types/v10";
import ms from "ms";

export const POST: RequestHandler = async ({
  url: { searchParams },
  cookies,
}) => {
  const refresh_token = searchParams.get("code");
  if (!refresh_token) {
    error(500, "No refresh token found");
  }

  const response = await fetch(RouteBases.api + OAuth2Routes.tokenURL, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
    headers: {
      "Authorization": `Basic ${btoa(`${DISCORD_ID}:${DISCORD_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await response.json();
  const result = tokenSchema.safeParse(data);
  if (result.error) {
    error(302, result.error);
  }
  const token = result.data;

  const access_token_expires_in = new Date(
    Date.now() + token.expires_in * 1000,
  );
  const refresh_token_expires_in = new Date(Date.now() + ms("30d"));

  cookies.set("discord_access_token", token.access_token, {
    path: "/",
    sameSite: "strict",
    expires: access_token_expires_in,
  });
  cookies.set("discord_refresh_token", token.refresh_token, {
    path: "/",
    sameSite: "strict",
    expires: refresh_token_expires_in,
  });
  return json(token);
};
