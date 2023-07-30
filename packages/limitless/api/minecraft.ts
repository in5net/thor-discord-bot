import { z } from "zod";

export async function getUUID(username: string): Promise<string> {
	const response = await fetch(
		`https://api.mojang.com/users/profiles/minecraft/${username}`,
	);
	const data = await response.json();
	return z.object({ id: z.string() }).parse(data).id;
}

export async function getUsername(uuid: string): Promise<string> {
	const response = await fetch(
		`https://api.mojang.com/user/profiles/${uuid}/names`,
	);
	const data = await response.json();
	return (
		z
			.array(z.object({ name: z.string() }))
			.parse(data)
			.at(-1)?.name || ""
	);
}
