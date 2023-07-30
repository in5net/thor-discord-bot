import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";

const admins = await db.query.users.findMany({
	columns: {
		id: true,
	},
	where: eq(users.admin, true),
});
export const ADMIN_IDS = admins.map(({ id }) => id);
