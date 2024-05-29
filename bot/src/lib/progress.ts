export interface ProgressBarOptions {
	current: number;
	total: number;
	columns?: number;
	complete?: string;
	incomplete?: string;
}

export function renderProgressBar(options: ProgressBarOptions) {
	const { current, total } = options;
	const percent = Math.floor((current / total) * 100);
	const progress = renderProgress(options);
	const totalStr = total.toString();
	return `[${progress}] ${current.toString().padStart(totalStr.length)}/${totalStr} ${percent.toString().padStart(3)}%`;
}

export function renderProgress({
	current,
	total,
	columns = 20,
	complete = "·*○",
	incomplete = " ",
}: ProgressBarOptions) {
	const progress = current / total;
	const fullyFilledChar = complete.at(-1) || "=";
	const parts = complete.length * columns;
	const filledCount = Math.floor(progress * columns);
	const partialParts = parts - filledCount;
	let str = fullyFilledChar.repeat(filledCount);
	if (partialParts > 0) {
		const partialChar = complete[partialParts - 1];
		str += partialChar;
	}
	str += incomplete.repeat(columns - str.length);
	return str;
}
