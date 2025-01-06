import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ parent }) => {
  const { dbUser } = await parent();
  if (!dbUser?.admin) {
    error(403, "You are not an admin");
  }
};
