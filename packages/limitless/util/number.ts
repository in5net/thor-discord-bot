export function toFloor(a: number, n: number): number {
	return Math.floor(a / n) * n;
}

// https://minershaven.fandom.com/wiki/Cash_Suffixes#List_of_Cash_Suffixes
export const suffixes: Array<
	[
		repeated: [
			ending: string,
			symbol: string,
			first?: string,
			firstSymbol?: string,
		],
		prefixes: Array<[long: string, short: string]>,
	]
> = [
	[
		["illion", "", "thousand", "k"],
		[
			["", ""],
			["m", "M"],
			["b", "B"],
			["tr", "T"],
			["quadr", "qd"],
			["quint", "Qn"],
			["sext", "sx"],
			["sept", "Sp"],
			["oct", "O"],
			["non", "N"],
		],
	],
	[
		["decillion", "D"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tre", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["sex", "sx"],
			["sept", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["vigintillion", "V"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tres", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["ses", "s"],
			["septem", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["trigintillion", "T"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tres", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["ses", "s"],
			["septen", "Sp"],
			["octo", "O"],
			["noven", "N"],
		],
	],
	[
		["quadragintillion", "qg"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tres", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["ses", "s"],
			["septen", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["quinquagintillion", "Qg"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tres", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["ses", "s"],
			["septen", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["sexagintillion", "Sx"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tres", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["se", "s"],
			["septen", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["septuagintillion", "Sp"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tre", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["se", "s"],
			["septen", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["octogintillion", "O"],
		[
			["", ""],
			["un", "u"],
			["duo", "d"],
			["tre", "t"],
			["quattuor", "qd"],
			["quin", "Qn"],
			["sex", "sx"],
			["septem", "Sp"],
			["octo", "O"],
			["novem", "N"],
		],
	],
	[
		["onagintillion", "N"],
		[
			["n", ""],
			["unn", "u"],
			["duon", "d"],
			["tren", "t"],
			["quattuorn", "qd"],
			["quinn", "Qn"],
			["sen", "sn"],
			["septen", "Sp"],
			["octon", "O"],
			["novem", "N"],
		],
	],
	[
		["centillion", "CT"],
		[
			["", ""],
			["un", "u"],
		],
	],
];

export function toSuffix(x: number, shortNotation = false): string {
	const power = Math.log10(x);
	const order = Math.floor(power);
	const order3 = Math.floor(order / 3);
	// 0-999,999.999
	if (order3 < 1) return x.toLocaleString();

	const order30 = Math.floor(order3 / 10);
	const suffix = suffixes[order30];
	if (suffix) {
		const [[ending, symbol, first = ending, firstSymbol = symbol], prefixes] =
			suffix;
		const index = order3 - order30 * 10 - 1;
		const [long, short] = prefixes[index]!;
		const n = toFloor(x / 10 ** (order3 * 3), 0.001);

		if (shortNotation) {
			if (index === 0) return `${n} ${firstSymbol}`;
			return `${n} ${short}${symbol}`;
		}

		if (index === 0) return `${n} ${first}`;
		return `${n} ${long}${ending}`;
	}

	return x.toString();
}
