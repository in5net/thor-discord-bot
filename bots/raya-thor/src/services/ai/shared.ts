import prisma from "$services/prisma";

export const MAX_BITS = 32;
export const NEW_BITS = 24;

async function getCreditAt(uid: string) {
	const user = await prisma.user.findUnique({
		where: {
			id: uid,
		},
	});

	let creditAt = user?.creditAt;
	if (!creditAt) {
		creditAt = new Date();
		creditAt.setHours(creditAt.getHours() - NEW_BITS);
	}

	const maxCreditAt = new Date();
	maxCreditAt.setHours(maxCreditAt.getHours() - MAX_BITS);
	if (creditAt < maxCreditAt) {
		creditAt = new Date();
		creditAt.setHours(creditAt.getHours() - MAX_BITS);
	}

	return creditAt;
}

export async function getBits(uid: string) {
	const creditAt = await getCreditAt(uid);
	const diff = Date.now() - creditAt.getTime();
	const hours = Math.floor(diff / (1000 * 60 * 60));
	return hours;
}

export async function subtractBits(uid: string, price: number) {
	const creditAt = await getCreditAt(uid);
	const diff = Date.now() - creditAt.getTime();
	const hours = Math.floor(diff / (1000 * 60 * 60));
	if (hours < price) return false;

	creditAt.setHours(creditAt.getHours() + price);
	await prisma.user.upsert({
		create: {
			id: uid,
			creditAt,
		},
		update: {
			creditAt,
		},
		where: {
			id: uid,
		},
	});
	return true;
}
