import prisma from "./prisma";

const admins = await prisma.user.findMany({
	select: {
		id: true,
	},
	where: {
		admin: true,
	},
});
export const ADMIN_IDS = admins.map(({ id }) => id);
