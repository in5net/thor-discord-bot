export const sleep = async (ms?: number) =>
	new Promise<void>(resolve => setTimeout(resolve, ms));

export function benchmark(func: () => any, iterations = 1_000_000) {
	const startTime = performance.now();
	for (let i = 0; i < iterations; i++) {
		func();
	}

	const endTime = performance.now();
	return (endTime - startTime) / iterations;
}
