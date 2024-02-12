import { swap } from "@in5net/std/array";
import { sleep } from "@in5net/std/async";
import { map } from "@in5net/std/math";
import { objectKeys } from "@in5net/std/object";
import { randomInt } from "@in5net/std/random";
import { max } from "@in5net/std/stats";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";
import ffmpeg from "fluent-ffmpeg";
import { nanoid } from "nanoid";
import { createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const size = 512;
const algorithms = {
	bubble,
	cocktail,
	comb,
	cycle,
	gnome,
	heap,
	insertion,
	merge,
	quick,
	selection,
	shell,
};

export default command(
	{
		desc: "Sorts a random array of numbers",
		options: {
			algorithm: {
				type: "choice",
				desc: "The algorithm to use",
				choices: objectKeys(algorithms),
				default: "quick",
			},
			length: {
				type: "int",
				desc: "The length of the array to sort",
				default: 50,
				min: 2,
				max: 2500,
			},
			iterations_per_frame: {
				type: "int",
				desc: "The number of iterations to perform per frame",
				default: 1,
				min: 1,
				max: 100,
			},
			opacity: {
				type: "float",
				desc: "The opacity of the background, 0-1",
				default: 1,
				min: 0,
				max: 1,
			},
			show_shuffle: {
				type: "bool",
				desc: "Whether to show the shuffle animation",
				default: false,
			},
		},
	},
	async (
		i,
		{ algorithm, length, iterations_per_frame, opacity, show_shuffle },
	) => {
		if (
			["bubble", "cocktail", "cycle", "selection"].includes(algorithm) &&
			length > 50
		)
			return i.reply("This algorithm is very slow for large arrays 💀");
		if (["gnome", "insertion"].includes(algorithm) && length > 200)
			return i.reply("This algorithm is kinda slow for large arrays 💀");
		await i.deferReply();
		let active: number[] = [];
		let index = 0;

		const { createCanvas } = await import("@napi-rs/canvas");
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");
		ctx.lineWidth = 1;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, size, size);

		const temporaryDir = join(tmpdir(), nanoid());
		await mkdir(temporaryDir);

		const randomNumberArray = Array.from<number>({ length })
			.fill(0)
			.map((_, i) => i + 1);
		const m = max(randomNumberArray);

		if (show_shuffle) await render();
		for (const [i, j] of shuffle(randomNumberArray)) {
			if (show_shuffle) {
				active = [i, j];
				await render();
				await sleep(0);
			}
		}

		active = [];
		if (show_shuffle) {
			for (let i = 0; i < 30; i++) {
				await render();
				await sleep(0);
			}
		}

		const iter = algorithms[algorithm](
			randomNumberArray,
			(a: number, b: number) => a - b,
		);

		let next = iter.next();
		await render();
		while (!next.done) {
			for (let i = 0; i < iterations_per_frame; i++) {
				next = iter.next();
				active = next.value || [];
				await sleep(0);
			}

			await render();
		}

		async function render() {
			ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
			ctx.fillRect(0, 0, size, size);

			const w = canvas.width / randomNumberArray.length;
			for (const [i, n] of randomNumberArray.entries()) {
				ctx.strokeStyle = ctx.fillStyle = active.includes(i) ? "#f00" : "#fff";

				const x = i * w;
				const y = map(n, 0, m, canvas.height, 0);
				const h = map(n, 0, m, 0, canvas.height);
				ctx.strokeRect(x, y, w, h);
				ctx.fillRect(x, y, w, h);
			}

			const path = join(
				temporaryDir,
				`frame${(index++).toString().padStart(4, "0")}.png`,
			);
			await writeFile(path, await canvas.encode("png"));
		}

		const name = `${algorithm}_sort_${length}.mp4`;
		await new Promise((resolve, reject) =>
			ffmpeg({ cwd: temporaryDir })
				.input("frame%04d.png")
				.fps(60)
				.videoCodec("libx264")
				.outputOptions(["-pix_fmt yuv420p"])
				.save(name)
				.once("end", resolve)
				.once("error", reject),
		);

		const outputPath = join(temporaryDir, name);
		const stream = createReadStream(outputPath);
		stream.once("close", async () => rm(temporaryDir, { recursive: true }));

		return i.editReply({
			files: [new AttachmentBuilder(stream, { name })],
		});
	},
);

function* shuffle<T>(array: T[]): Generator<[number, number]> {
	for (let i = 0, { length } = array; i < length; i++) {
		const index = randomInt(i, length);
		swap(array, i, index);
		yield [i, index];
	}
}

const gapFactor = 1.3;

type SortingGenerator = Generator<number[], void>;

function* bubble<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	for (let i = 0; i < length; i++) {
		for (let j = 0; j < length - 1 - i; j++) {
			if (compare(array[j]!, array[j + 1]!) > 0) swap(array, j, j + 1);
			yield [j, j + 1];
		}
	}
}

function* cocktail<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	let start = 0;
	let end = length - 1;
	while (start < end) {
		for (let i = start; i < end; i++) {
			if (compare(array[i]!, array[i + 1]!) > 0) swap(array, i, i + 1);
			yield [i, i + 1];
		}

		end--;
		for (let i = end; i > start; i--) {
			if (compare(array[i]!, array[i - 1]!) < 0) swap(array, i, i - 1);
			yield [i, i - 1];
		}

		start++;
	}
}

function* selection<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	for (let i = 0; i < length; i++) {
		let min = i;
		for (let j = i + 1; j < length; j++) {
			if (compare(array[j]!, array[min]!) < 0) min = j;
			yield [j];
		}

		if (min !== i) swap(array, i, min);
		yield [i, min];
	}
}

function* insertion<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	for (let i = 1; i < length; i++) {
		let j = i;
		while (j > 0 && compare(array[j]!, array[j - 1]!) < 0) {
			swap(array, j, j - 1);
			j--;
			yield [j, j - 1];
		}
	}
}

function* quick<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	function* sort(left: number, right: number): SortingGenerator {
		if (left >= right) return;
		const pivot = array[left];
		let i = left + 1;
		let j = right;
		while (i <= j) {
			while (i <= right && compare(array[i]!, pivot!) <= 0) i++;
			while (j > left && compare(array[j]!, pivot!) > 0) j--;
			if (i < j) swap(array, i, j);
			yield [left, i, j];
		}

		swap(array, left, j);
		yield* sort(left, j - 1);
		yield* sort(j + 1, right);
	}

	yield* sort(0, length - 1);
}

function* shell<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	let gap = Math.floor(length / 2);
	while (gap > 0) {
		for (let i = gap; i < length; i++) {
			let j = i;
			while (j >= gap && compare(array[j]!, array[j - gap]!) < 0) {
				swap(array, j, j - gap);
				j -= gap;
				yield [j, j - gap];
			}
		}

		gap = Math.floor(gap / gapFactor);
	}
}

function* merge<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	function* mergeSort(left: number, right: number): SortingGenerator {
		if (left >= right) return;
		const mid = Math.floor((left + right) / 2);
		yield* mergeSort(left, mid);
		yield* mergeSort(mid + 1, right);
		const temporary = Array.from<T>({ length: right - left + 1 });
		let i = left;
		let j = mid + 1;
		let k = 0;
		while (i <= mid && j <= right) {
			if (compare(array[i]!, array[j]!) < 0) {
				temporary[k] = array[i]!;
				i++;
			} else {
				temporary[k] = array[j]!;
				j++;
			}

			k++;
			yield [i, j];
		}

		while (i <= mid) {
			temporary[k] = array[i]!;
			i++;
			k++;
			yield [i];
		}

		while (j <= right) {
			temporary[k] = array[j]!;
			j++;
			k++;
			yield [j];
		}

		for (const [m, element] of temporary.entries()) {
			array[left + m] = element;
			yield [left + m];
		}
	}

	yield* mergeSort(0, length - 1);
}

function* heap<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	function* heapify(i: number, length: number): SortingGenerator {
		const left = 2 * i + 1;
		const right = 2 * i + 2;
		let largest = i;
		if (left < length && compare(array[left]!, array[largest]!) > 0)
			largest = left;
		if (right < length && compare(array[right]!, array[largest]!) > 0)
			largest = right;
		if (largest !== i) {
			swap(array, i, largest);
			yield [i, largest];
			yield* heapify(largest, length);
		}
	}

	for (let i = Math.floor(length / 2); i >= 0; i--) {
		yield* heapify(i, length);
	}

	for (let i = length - 1; i > 0; i--) {
		swap(array, 0, i);
		yield [0, i];
		yield* heapify(0, i);
	}
}

function* comb<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	let gap = Math.floor(length / 2);
	while (gap > 0) {
		for (let i = 0; i < length; i++) {
			for (let j = i; j < length; j += gap) {
				if (compare(array[j]!, array[i]!) < 0) {
					swap(array, i, j);
					yield [i, j];
				}
			}
		}

		gap = Math.floor(gap / gapFactor);
	}
}

function* gnome<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	let i = 0;
	while (i < length) {
		if (!i) i++;
		if (compare(array[i]!, array[i - 1]!) > 0) i++;
		else {
			swap(array, i, i - 1);
			yield [i, i - 1];
			i--;
		}
	}
}

function* cycle<T>(
	array: T[],
	compare: (a: T, b: T) => number,
): SortingGenerator {
	const { length } = array;
	for (let start = 0; start < length - 1; start++) {
		let item = array[start]!;

		let pos = start;
		for (let i = start + 1; i < length; i++) {
			if (compare(array[i]!, item) < 0) pos++;
			yield [start, i];
		}

		if (pos === start) continue;

		while (item === array[pos]) pos++;
		[array[pos], item] = [item, array[pos]!];
		yield [start, pos];

		while (pos !== start) {
			pos = start;
			for (let i = start + 1; i < length; i++) {
				if (compare(array[i]!, item) < 0) pos++;
				yield [start, i];
			}

			while (item === array[pos]) pos++;
			[array[pos], item] = [item, array[pos]!];
			yield [start, pos];
		}
	}
}
