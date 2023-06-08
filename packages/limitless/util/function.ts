type Func = (...args: any[]) => any;

export function throttle<T extends Func>(
	func: T,
	ms: number
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
	ms: number
): (...args: Parameters<T>) => void {
	let timeout: number;
	return (...args) => {
		clearTimeout(timeout);
		setTimeout(() => func, ms, ...args);
	};
}

export function memoize<P, R>(func: (arg: P) => R): (arg: P) => R {
	const outputs = new Map<P, R>();
	return (arg: P) => {
		let output = outputs.get(arg);
		if (output) return output;
		output = func(arg);
		outputs.set(arg, output);
		return output;
	};
}
