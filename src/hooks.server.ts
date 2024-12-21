import type { Handle } from "@sveltejs/kit";

const DISCORD_API_URL = "https://discordapp.com/api";

export const handle: Handle = async ({ event, resolve }) => {
  const {
    url: { origin },
    cookies,
  } = event;
  const disco_refresh_token = cookies.get("disco_refresh_token");
  const disco_access_token = cookies.get("disco_access_token");

  if (disco_refresh_token) {
    if (disco_access_token) {
      console.log("setting discord user via access token..");
      const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
        headers: { Authorization: `Bearer ${disco_access_token}` },
      });

      // returns a discord user if JWT was valid
      const response = await request.json();

      if (response.id) {
        event.locals.authUser = response;
      }
    } else {
      const discord_request = await fetch(
        `${origin}/auth/refresh?code=${disco_refresh_token}`,
      );
      const discord_response = await discord_request.json();

      if (discord_response.disco_access_token) {
        console.log("setting discord user via refresh token..");
        const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
          headers: {
            Authorization: `Bearer ${discord_response.disco_access_token}`,
          },
        });

        // returns a discord user if JWT was valid
        const response = await request.json();

        if (response.id) {
          event.locals.authUser = response;
        }
      }
    }
  }

  return resolve(event);
};
