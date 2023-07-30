type Func = (...args: any[]) => any;

export function throttle<T extends Func>(
	func: T,
	ms: number,
): (...args: Parameters<T>) => void {
	let timeout: number | undefined;
	return (...args) => {
		if (timeout === undefined)
			setTimeout(() => {
				func(...args);
				timeout = undefined;
			}, ms);
	};
}

export function debounce<T extends Func>(
	func: T,
	ms: number,
): (...args: Parameters<T>) => void {
	let timeout: number;
	return (...args) => {
		clearTimeout(timeout);
		setTimeout(() => func, ms, ...args);
	};
}

export function memoize<P, R>(func: (arg: P) => R) {
	const outputs = new Map<P, R>();
	return (arg: P) => {
		let output = outputs.get(arg);
		if (output) return output;
		output = func(arg);
		outputs.set(arg, output);
		return output;
	};
}

export function memo<T>(fn: () => T) {
	let cache: T;
	let called = false;
	return () => {
		if (called) return cache;
		cache = fn();
		called = true;
		return cache;
	};
}

export function ttlCache<T>(fn: () => T, ttl: number) {
	let cache: T;
	let called = false;
	let lastCalled = performance.now();
	return () => {
		if (called && performance.now() - lastCalled < ttl) return cache;
		cache = fn();
		called = true;
		lastCalled = performance.now();
		return cache;
	};
}
