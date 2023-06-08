import { random } from "../funcs";

type Mat = number[][];

export default class Matrix {
	[i: number]: Float64Array;

	rows: number;
	cols: number;

	constructor(rows: number, cols: number);
	constructor(mat: Mat);
	constructor(rowsOrMat: number | Mat, cols?: number) {
		if (typeof rowsOrMat === "number") {
			cols = cols || 0;
			for (let i = 0; i < rowsOrMat; i++) {
				this[i] = new Float64Array(cols).fill(0);
			}

			this.rows = rowsOrMat;
			this.cols = cols;
		} else {
			for (const [i, element] of rowsOrMat.entries()) {
				const row = element;
				this[i] = new Float64Array(row);
			}

			this.rows = rowsOrMat.length;
			this.cols = rowsOrMat[0]!.length;
		}
	}

	toString(): string {
		const [...rows] = this;
		return `mat [
  ${rows.map(row => row.join(" ")).join("\n  ")}
]`;
	}

	log(): this {
		console.log(this.toString());
		return this;
	}

	*[Symbol.iterator](): Iterator<Float64Array> {
		const { rows } = this;
		for (let i = 0; i < rows; i++) {
			yield this[i]!;
		}
	}

	copy(): Matrix {
		const { rows, cols } = this;
		return mat(rows, cols).set(this);
	}

	static fromArray(array: number[]): Matrix {
		const { length } = array;
		const m = mat(length, 1);
		for (let i = 0; i < length; i++) {
			m[i]![0] = array[i]!;
		}

		return m;
	}

	toArray(): number[] {
		return [...this].flatMap(row => [...row]);
	}

	static random(rows: number, cols: number): Matrix {
		const m = mat(rows, cols);
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				m[i]![j] = random(-1, 1);
			}
		}

		return m;
	}

	set(m: Matrix | Mat): this {
		const { rows, cols } = this;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				this[i]![j] = m[i]![j]!;
			}
		}

		return this;
	}

	equals(m: Matrix | Mat): boolean {
		const { rows, cols } = this;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const a = this[i]![j]!;
				const b = m[i]![j]!;
				if (Math.abs(a - b) > Number.EPSILON) return false;
			}
		}

		return true;
	}

	add(m: Matrix | Mat): this {
		const { rows, cols } = this;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				this[i]![j] += m[i]![j]!;
			}
		}

		return this;
	}

	static add(m1: Matrix, m2: Matrix | Mat): Matrix {
		return m1.copy().add(m2);
	}

	sub(m: Matrix | Mat): this {
		const { rows, cols } = this;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				this[i]![j] -= m[i]![j]!;
			}
		}

		return this;
	}

	static sub(m1: Matrix, m2: Matrix | Mat): Matrix {
		return m1.copy().sub(m2);
	}

	mult(m: Matrix | number): this {
		return this.set(Matrix.mult(this, m));
	}

	static mult(m1: Matrix, m2: Matrix | number): Matrix {
		if (typeof m2 === "number") {
			const { rows, cols } = m1;
			const ans = mat(rows, cols);
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					ans[i]![j] = m1[i]![j]! * m2;
				}
			}

			return ans;
		}

		const ans = mat(m1.rows, m2.cols);
		const { rows, cols } = ans;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				let sum = 0;
				for (let k = 0; k < m1.cols; k++) {
					sum += m1[i]![k]! * m2[k]![j]!;
				}

				ans[i]![j] = sum;
			}
		}

		return ans;
	}

	div(m: number): this {
		return this.mult(1 / m);
	}

	static transpose(m: Matrix): Matrix {
		const { rows, cols } = m;
		const ans = mat(cols, rows);
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				ans[j]![i] = m[i]![j]!;
			}
		}

		return ans;
	}

	map(func: (value: number, i: number, j: number) => number): this {
		const { rows, cols } = this;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				this[i]![j] = func(this[i]![j]!, i, j);
			}
		}

		return this;
	}

	static map(
		m: Matrix,
		func: (value: number, i: number, j: number) => number
	): Matrix {
		return m.copy().map(func);
	}
}

export function mat(rows: number, cols: number): Matrix;
export function mat(mat: Mat): Matrix;
export function mat(rowsOrMat: number | Mat, cols?: number): Matrix {
	if (typeof rowsOrMat === "number") return new Matrix(rowsOrMat, cols || 0);
	return new Matrix(rowsOrMat);
}
