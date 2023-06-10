export const API_BASE = "https://nekobot.xyz/api";

export async function fetchNekoBot<TBody>(endpoint: string) {
	const response = await fetch(`${API_BASE}/${endpoint}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = (await response.json()) as TBody;
	return data;
}

export async function imagegen(
	type: string,
	searchParams: Record<string, string> = {}
) {
	const params = new URLSearchParams({
		type,
		...searchParams,
	});
	const data = await fetchNekoBot<{ message: string }>(`endpoint?${params}`);
	return data.message;
}
