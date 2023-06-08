export const sleep = async (ms?: number): Promise<void> =>
	new Promise(resolve => setTimeout(resolve, ms));

export function benchmark(func: () => any, iterations = 1_000_000): number {
	const startTime = Date.now();
	for (let i = 0; i < iterations; i++) {
		func();
	}

	const endTime = Date.now();
	return (endTime - startTime) / iterations;
}
