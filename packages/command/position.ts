export class Position {
	constructor(
		readonly text: string,
		public row = 0,
		public col = 0,
		public index = 0,
	) {}

	static EOF = new Position("", -1, -1, -1);

	static textBetween(p1: Position, p2: Position): string {
		if (p1.row === p2.row)
			return `${p1.row + 1} ${p1.text.slice(p1.index, p2.index)}`;

		const lines = p1.text.split("\n");
		let text = "";
		for (let row = p1.row; row <= p2.row; row++) {
			const line = lines[row] || "";
			text += `${row + 1} `;
			if (row === p1.row) text += line.slice(p1.col);
			else if (row === p2.row) text += line.slice(0, p2.col);
			else text += line;
			text += "\n";
		}

		return text.slice(0, -1);
	}

	copy(): Position {
		return new Position(this.text, this.row, this.col, this.index);
	}

	advance() {
		const char = this.text[this.index++];
		if (char === "\n") {
			this.row++;
			this.col = 0;
		}
	}
}
