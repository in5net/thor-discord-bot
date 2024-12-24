import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
  if (!user) {
    redirect(302, "/login");
  }
  return {
    user,
  };
};
