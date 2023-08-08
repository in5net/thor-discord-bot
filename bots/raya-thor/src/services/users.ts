import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";

export async function getUser(id: string) {
	const user = await db.query.users.findFirst({
		where: eq(users.id, id),
	});
	if (!user) throw new Error("User not found");
	return user;
}

export const incCount = async (id: string, name: string) => {
	const user = await db.query.users.findFirst({
		columns: {
			counts: true,
		},
		where: eq(users.id, id),
	});
	const counts = (user?.counts || {}) as Record<string, number>;
	await db
		.insert(users)
		.values({
			id,
			updatedAt: new Date(),
			counts: {
				[name]: 1,
			},
		})
		.onDuplicateKeyUpdate({
			set: {
				updatedAt: new Date(),
				counts: {
					...counts,
					[name]: (counts[name] || 0) + 1,
				},
			},
		});
};
