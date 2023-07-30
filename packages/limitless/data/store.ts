/* eslint-disable @typescript-eslint/ban-ts-comment */

// This is mainly the observables in https://github.com/jbreckmckye/trkl with the Svelte store contract and a few other changes

type Subscriber<T> = (newValue: T, oldValue?: T) => any;
type Subscribe<T> = (subscriber: Subscriber<T>) => () => void;

interface Store<T> {
	(updater?: (oldValue: T) => T): T;
	(newValue: T): T;
	set(newValue: T): T;
	update(updater: (oldValue: T) => T): T;
	subscribe: Subscribe<T>;
	unsubscribe(subscriber: Subscriber<any>): void;
}

const computedStack: Array<() => void> = [];

export default function atom<T>(value?: T): Store<T> {
	const subscribers = new Set<Subscriber<T>>();

	function read(): T {
		const runningComputation = computedStack.at(-1);
		if (runningComputation) subscribers.add(runningComputation);
		return value as T;
	}

	// @ts-expect-error
	const store: Store<T> = (...args) => {
		if (!args.length) return read();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const newValue: T =
			// @ts-expect-error
			typeof args[0] === "function" ? args[0](read()) : args[0];
		if (newValue === value) return;

		const oldValue = value;
		value = newValue;

		for (const subscriber of subscribers) {
			subscriber(newValue, oldValue);
		}
	};

	store.set = value => store(value);
	store.update = updater => {
		const newValue = updater(store());
		return store(newValue);
	};

	store.subscribe = subscriber => {
		subscribers.add(subscriber);
		subscriber(value as T);
		return () => subscribers.delete(subscriber);
	};

	store.unsubscribe = subscriber => subscribers.delete(subscriber);

	return store;
}

export function computed<T>(executor: () => T): Store<T> {
	const store = atom<T>();

	function computation() {
		if (computedStack.includes(computation))
			throw new Error("Circular computation");

		computedStack.push(computation);
		let result: T;
		let error: Error | undefined;
		try {
			result = executor();
		} catch (error_) {
			if (error_ instanceof Error) error = error_;
		}

		computedStack.pop();
		if (error) throw error;
		// @ts-expect-error
		store(result);
	}

	computation();

	return store;
}

export function from<T>(executor: (store: Store<T>) => any, initialValue?: T) {
	const store = atom(initialValue);
	executor(store);
	return store;
}
