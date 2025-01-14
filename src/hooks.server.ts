import type { Handle } from "@sveltejs/kit";
import {
  type RESTGetAPIUserResult,
  RouteBases,
  Routes,
} from "discord-api-types/v10";

export const handle: Handle = async ({ event, resolve }) => {
  const {
    url: { origin },
    cookies,
  } = event;
  const access_token = cookies.get("discord_access_token");
  const refresh_token = cookies.get("discord_refresh_token");

  if (refresh_token) {
    if (access_token) {
      const userResponse = await fetch(RouteBases.api + Routes.user(), {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = (await userResponse.json()) as RESTGetAPIUserResult;

      event.locals.user = user;
    } else {
      const response = await fetch(
        `${origin}/api/auth/refresh?code=${refresh_token}`,
      );
      const token = await response.json();

      if (token.access_token) {
        const userResponse = await fetch(RouteBases.api + Routes.user(), {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const user = (await userResponse.json()) as RESTGetAPIUserResult;

        event.locals.user = user;
      }
    }
  }

  return resolve(event);
};
