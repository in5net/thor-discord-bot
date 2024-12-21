import { DISCORD_ID, DISCORD_CLIENT_SECRET } from "$env/static/private";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  url: { origin, searchParams },
  cookies,
}) => {
  const returnCode = searchParams.get("code") || "";
  console.log("returnCode =>", returnCode);

  const request = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: `${origin}/auth/session`,
      code: returnCode,
    }),
    headers: {
      "Authorization": `Basic ${btoa(`${DISCORD_ID}:${DISCORD_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const response = await request.json();
  console.log("response =>", response);

  if (response.error) {
    console.log("redirect to / due error", response.error);
    throw redirect(302, "/");
  }

  const access_token_expires_in = new Date(
    Date.now() + response.expires_in * 1000,
  ); // 10 minutes
  const refresh_token_expires_in = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ); // 30 days
  console.log("redirect to / with cookies");

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
  throw redirect(302, "/");
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete("disco_access_token", { path: "/" });
  cookies.delete("disco_refresh_token", { path: "/" });
  throw redirect(302, "/");
};
