export const API_BASE = "https://nekobot.xyz/api";

export async function fetchNekoBot<TBody>(endpoint: string) {
	const response = await fetch(`${API_BASE}/${endpoint}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	const text = await response.text();
	console.log(text);
	const data = JSON.parse(text) as TBody;
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
	const data = await fetchNekoBot<{ message: string }>(`imagegen?${params}`);
	return data.message;
}
