import { DISCORD_ID, DISCORD_CLIENT_SECRET } from "$env/static/private";
import { tokenSchema } from "../shared";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { OAuth2Routes, RouteBases } from "discord-api-types/v10";
import ms from "ms";

export const GET: RequestHandler = async ({
  url: { origin, searchParams },
  cookies,
}) => {
  const code = searchParams.get("code");
  if (!code) {
    error(400, "code missing");
  }

  const response = await fetch(RouteBases.api + OAuth2Routes.tokenURL, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: `${origin}/api/auth/session`,
      code,
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
  redirect(302, "/");
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  const access_token = cookies.get("discord_access_token");
  if (access_token) {
    await fetch(RouteBases.api + OAuth2Routes.tokenRevocationURL, {
      method: "POST",
      body: new URLSearchParams({
        token: access_token,
        token_type_hint: "access_token",
      }),
      headers: {
        "Authorization": `Basic ${btoa(`${DISCORD_ID}:${DISCORD_CLIENT_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  cookies.delete("discord_access_token", { path: "/" });
  cookies.delete("discord_refresh_token", { path: "/" });
  redirect(302, "/");
};
