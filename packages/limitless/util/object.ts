export const objectKeys = Object.keys as <T>(object: T) => Array<keyof T>;

export const hasOwn = (object: any, key: PropertyKey) =>
	Object.prototype.hasOwnProperty.call(object, key);

export function shallowEquals<
	A extends Record<any, any>,
	B extends Record<any, any>
>(a: A, b: B): boolean {
	// @ts-expect-error it is possible for A and B to be the same object
	if (a === b) return true;
	for (const key in a) {
		if (hasOwn(a, key) && !hasOwn(b, key)) return false;
	}

	for (const key in b) {
		if (hasOwn(b, key) && !hasOwn(a, key)) return false;
	}

	return true;
}

export function deepEquals<
	A extends Record<any, any>,
	B extends Record<any, any>
>(a: A, b: B): boolean {
	// @ts-expect-error it is possible for A and B to be the same object
	if (a === b) return true;
	// eslint-disable-next-line no-eq-null, eqeqeq
	if (a == null || b == null) return false;
	if (a.constructor !== b.constructor) return false;
	for (const key in a) {
		if (hasOwn(a, key)) {
			if (!hasOwn(b, key)) return false;
			// @ts-expect-error the properties of A and B can be equal
			if (a[key] === b[key]) continue;
			if (typeof a[key] !== "object") return false;
			if (!deepEquals(a[key], b[key])) return false;
		}
	}

	for (const key in b) {
		if (hasOwn(b, key)) {
			if (!hasOwn(a, key)) return false;
			// @ts-expect-error the properties of A and B can be equal
			if (a[key] === b[key]) continue;
			if (typeof b[key] !== "object") return false;
			if (!deepEquals(a[key], b[key])) return false;
		}
	}

	return true;
}

export function deepCopy<T>(object: T): T {
	// eslint-disable-next-line no-eq-null, eqeqeq
	if (object == null) return object;
	// @ts-expect-error Array.isArray returns an unknown[]
	if (Array.isArray(object)) return object.map(deepCopy);
	if (typeof object !== "object") return object;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const copy = Object.create(Object.getPrototypeOf(object)) as T;
	for (const key in object) {
		if (hasOwn(object, key)) copy[key] = deepCopy(object[key]);
	}

	return copy;
}

export function value2Keys<K extends string, T extends string>(
	object: Record<K, T[]>
): Record<T, K[]> {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const result = {} as Record<T, K[]>;
	for (const [key, array] of Object.entries(object)) {
		for (const v of array as T[]) {
			if (!result[v]) result[v] = [];
			result[v].push(key as K);
		}
	}

	return result;
}
